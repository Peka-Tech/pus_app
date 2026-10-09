import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type SidebarAccent =
  | 'blue'
  | 'cyan'
  | 'violet'
  | 'green'
  | 'amber'
  | 'rose';

export interface SidebarItemI {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  badge?: string | number;
  accent?: SidebarAccent;
  disabled?: boolean;
  hidden?: boolean;
  children?: readonly SidebarItemI[];
}

export interface SidebarNavigationEventI {
  item: SidebarItemI;
  path: readonly SidebarItemI[];
}
export interface SidebarProfileI {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  status?: 'online' | 'away' | 'offline';
}


@Component({
  selector: 'pus-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() title = 'Peka Universe';
  @Input() subtitle = 'Universal System';
  @Input() logoIcon = 'pi pi-sparkles';

  @Input()
  items: readonly SidebarItemI[] = [];

  @Input() activeId?: string;
  @Input() mobileBreakpoint = 900;

  @Output()
  readonly itemClick =
    new EventEmitter<SidebarNavigationEventI>();

  @Output()
  readonly collapsedChange =
    new EventEmitter<boolean>();

  collapsed = false;
  mobileOpen = false;
  isMobile = false;

  private readonly expandedIds = new Set<string>();

  @Input()
profile?: SidebarProfileI;

@Output()
readonly profileClick =
  new EventEmitter<SidebarProfileI>();

openProfile(): void {
  if (!this.profile) {
    return;
  }

  this.profileClick.emit(this.profile);
  this.closeMobile();
}

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: object,
    private readonly changeDetector:
      ChangeDetectorRef
  ) {}

  @HostBinding('class.pus-sidebar-host-collapsed')
  get hostCollapsed(): boolean {
    return this.collapsed && !this.isMobile;
  }

  @HostBinding('class.pus-sidebar-host-mobile')
  get hostMobile(): boolean {
    return this.isMobile;
  }

  ngOnInit(): void {
    this.updateViewport();
    this.expandActivePath();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['items'] ||
      changes['activeId']
    ) {
      this.expandActivePath();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const wasMobile = this.isMobile;

    this.updateViewport();

    if (!wasMobile && this.isMobile) {
      this.mobileOpen = false;
    }

    if (wasMobile && !this.isMobile) {
      this.mobileOpen = false;
    }

    this.refreshView();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobile();
  }

  visibleItems(
    items: readonly SidebarItemI[]
  ): SidebarItemI[] {
    return items.filter(item => !item.hidden);
  }

  hasChildren(item: SidebarItemI): boolean {
    return Boolean(
      item.children?.some(child => !child.hidden)
    );
  }

  isExpanded(item: SidebarItemI): boolean {
    return this.expandedIds.has(item.id);
  }

  isActive(item: SidebarItemI): boolean {
    return item.id === this.activeId;
  }

  getAccentClass(item: SidebarItemI): string {
    return `pus-accent-${item.accent ?? 'blue'}`;
  }

  getItemPadding(level: number): number {
    return 0.7 + level * 0.85;
  }

  toggleCollapsed(): void {
    this.updateViewport();

    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
      this.refreshView();
      return;
    }

    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
    this.refreshView();
  }

  /**
   * Cette méthode peut être appelée depuis AppComponent.
   * markForCheck() est donc nécessaire avec OnPush.
   */
  toggleMobile(): void {
    this.updateViewport();

    if (!this.isMobile) {
      this.collapsed = !this.collapsed;
      this.collapsedChange.emit(this.collapsed);
      this.refreshView();
      return;
    }

    this.mobileOpen = !this.mobileOpen;
    this.refreshView();
  }

  openMobile(): void {
    this.updateViewport();

    if (!this.isMobile) {
      return;
    }

    this.mobileOpen = true;
    this.refreshView();
  }

  closeMobile(): void {
    if (!this.mobileOpen) {
      return;
    }

    this.mobileOpen = false;
    this.refreshView();
  }

  onItemClick(
    item: SidebarItemI,
    event: Event
  ): void {
    event.preventDefault();

    if (item.disabled) {
      return;
    }

    if (this.hasChildren(item)) {
      if (this.collapsed && !this.isMobile) {
        this.collapsed = false;
        this.collapsedChange.emit(false);
      }

      this.toggleGroup(item);
      this.refreshView();
      return;
    }

    const path =
      this.findPath(this.items, item.id) ?? [item];

    this.itemClick.emit({
      item,
      path
    });

    this.closeMobile();
  }

  private toggleGroup(item: SidebarItemI): void {
    if (this.expandedIds.has(item.id)) {
      this.expandedIds.delete(item.id);
      return;
    }

    this.expandedIds.add(item.id);
  }

  private updateViewport(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isMobile = false;
      return;
    }

    this.isMobile =
      window.innerWidth < this.mobileBreakpoint;
  }

  private refreshView(): void {
    this.changeDetector.markForCheck();
  }

  private expandActivePath(): void {
    if (!this.activeId) {
      return;
    }

    const path = this.findPath(
      this.items,
      this.activeId
    );

    if (!path) {
      return;
    }

    for (const item of path.slice(0, -1)) {
      this.expandedIds.add(item.id);
    }
  }

  private findPath(
    items: readonly SidebarItemI[],
    id: string,
    parents: readonly SidebarItemI[] = []
  ): SidebarItemI[] | undefined {
    for (const item of items) {
      const path = [...parents, item];

      if (item.id === id) {
        return path;
      }

      if (item.children?.length) {
        const found = this.findPath(
          item.children,
          id,
          path
        );

        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }
}