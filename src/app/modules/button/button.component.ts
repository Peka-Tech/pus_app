import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MenuItem } from 'primeng/api';

import { datasGlobalI } from '../../global/interface/data.interface';
import {
  UISeverityEnum,
  UIVariantEnum,
} from '../../global/interface/data.enums';

export interface ButtonEventI {
  button: datasGlobalI;
  event?: Event;
}

export interface PusMenuItem extends MenuItem {
  button?: datasGlobalI;
  items?: PusMenuItem[];
}

export type PrimeButtonSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'help'
  | 'danger'
  | 'contrast';

@Component({
  selector: 'pus-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements OnInit, OnChanges {
  @Input() buttons: readonly datasGlobalI[] = [];

  @Input() breakpoint = 900;
  @Input() desktopLimit = 5;
  @Input() mobileLimit = 2;

  @Input() groupLabel = 'Options';
  @Input() groupIcon = 'pi pi-ellipsis-v';

  @Output()
  readonly buttonClick = new EventEmitter<ButtonEventI>();

  isSmallScreen = false;
  groupedItems: PusMenuItem[] = [];
  renderedButtons: datasGlobalI[] = [];

  private readonly menuItemsByButton = new Map<datasGlobalI, PusMenuItem[]>();

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    this.updateScreenMode();
    this.rebuild();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['breakpoint']) {
      this.updateScreenMode();
    }

    if (changes['buttons']) {
      this.rebuild();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const previousMode = this.isSmallScreen;

    this.updateScreenMode();

    if (previousMode !== this.isSmallScreen) {
      this.rebuild();
    }
  }

  get useGroupMode(): boolean {
    const configuredLimit = this.isSmallScreen
      ? this.mobileLimit
      : this.desktopLimit;

    const limit = Math.max(0, configuredLimit);

    return this.renderedButtons.length > limit;
  }

  get groupDisabled(): boolean {
    return !this.renderedButtons.some((button) =>
      this.hasEnabledAction(button),
    );
  }

  isMenu(button: datasGlobalI): boolean {
    return Array.isArray(button.buttons) && button.buttons.length > 0;
  }

  getMenuItems(button: datasGlobalI): PusMenuItem[] {
    return this.menuItemsByButton.get(button) ?? [];
  }

  getLabel(button: datasGlobalI): string {
    return button.label?.trim() || button.name?.trim() || button.dataKey;
  }

  getIcon(button: datasGlobalI): string | undefined {
    return button.configurations?.icon;
  }

  getSeverity(button: datasGlobalI): PrimeButtonSeverity {
    switch (button.configurations?.severity) {
      case UISeverityEnum.Primary:
        return 'primary';

      case UISeverityEnum.Secondary:
        return 'secondary';

      case UISeverityEnum.Success:
        return 'success';

      case UISeverityEnum.Info:
        return 'info';

      case UISeverityEnum.Warning:
        return 'warn';

      case UISeverityEnum.Danger:
        return 'danger';

      case UISeverityEnum.Contrast:
        return 'contrast';

      case UISeverityEnum.Neutral:
      default:
        return 'secondary';
    }
  }

  isDisabled(button: datasGlobalI): boolean {
    return button.controls?.disabled === true;
  }

  isHidden(button: datasGlobalI): boolean {
    return button.controls?.hidden === true;
  }

  isLoading(button: datasGlobalI): boolean {
    return button.controls?.loading === true;
  }

  isOutlined(button: datasGlobalI): boolean {
    return button.configurations?.variant === UIVariantEnum.Outlined;
  }

  isText(button: datasGlobalI): boolean {
    const variant = button.configurations?.variant;

    return (
      variant === UIVariantEnum.Text ||
      variant === UIVariantEnum.Ghost ||
      variant === UIVariantEnum.Flat
    );
  }

  isRaised(button: datasGlobalI): boolean {
    return button.configurations?.variant === UIVariantEnum.Raised;
  }

  isLink(button: datasGlobalI): boolean {
    return button.configurations?.variant === UIVariantEnum.Link;
  }

  onClick(button: datasGlobalI, event?: Event): void {
    if (this.isMenu(button)) {
      return;
    }

    this.emitButton(button, event);
  }

  onMenuItemClick(item: PusMenuItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    /*
     * Un élément possédant des enfants est seulement
     * un conteneur de sous-menu.
     */
    if ((item.items?.length ?? 0) > 0) {
      return;
    }

    if (!item.button) {
      return;
    }

    event.preventDefault();

    this.emitButton(item.button, event);
  }

  private emitButton(button: datasGlobalI, event?: Event): void {
    if (
      this.isHidden(button) ||
      this.isDisabled(button) ||
      this.isLoading(button)
    ) {
      return;
    }

    this.buttonClick.emit({
      button,
      event,
    });
  }

  private rebuild(): void {
    this.renderedButtons = this.buttons.filter((button) =>
      this.isRenderable(button),
    );

    this.menuItemsByButton.clear();

    for (const button of this.renderedButtons) {
      if (!this.isMenu(button)) {
        continue;
      }

      this.menuItemsByButton.set(
        button,
        this.buildMenuItems(this.getVisibleChildren(button)),
      );
    }

    this.groupedItems = this.buildMenuItems(this.renderedButtons);
  }

  private isRenderable(button: datasGlobalI): boolean {
    if (this.isHidden(button)) {
      return false;
    }

    /*
     * Un menu sans enfant visible ne doit pas
     * apparaître et ne doit jamais devenir une action.
     */
    if (this.isMenu(button)) {
      return this.getVisibleChildren(button).length > 0;
    }

    return true;
  }

  private getVisibleChildren(button: datasGlobalI): datasGlobalI[] {
    if (!this.isMenu(button)) {
      return [];
    }

    return (button.buttons ?? []).filter((child) => this.isRenderable(child));
  }

  private hasEnabledAction(button: datasGlobalI): boolean {
    if (
      !this.isRenderable(button) ||
      this.isDisabled(button) ||
      this.isLoading(button)
    ) {
      return false;
    }

    if (!this.isMenu(button)) {
      return true;
    }

    return this.getVisibleChildren(button).some((child) =>
      this.hasEnabledAction(child),
    );
  }

  private buildMenuItems(buttons: readonly datasGlobalI[]): PusMenuItem[] {
    return buttons
      .filter((button) => this.isRenderable(button))
      .map((button) => this.buildMenuItem(button));
  }

  private buildMenuItem(button: datasGlobalI): PusMenuItem {
    const disabled = this.isDisabled(button) || this.isLoading(button);

    if (this.isMenu(button)) {
      return {
        id: String(button._id),
        label: this.getLabel(button),
        icon: this.getIcon(button),
        disabled,
        button,
        items: this.buildMenuItems(this.getVisibleChildren(button)),
      };
    }

    return {
      id: String(button._id),
      label: this.getLabel(button),
      icon: this.getIcon(button),
      disabled,
      button,
    };
  }

  private updateScreenMode(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isSmallScreen = false;
      return;
    }

    this.isSmallScreen = window.innerWidth < this.breakpoint;
  }
}
