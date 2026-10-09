import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

import { datasGlobalI } from '../../global/interface/data.interface';
import {
  UIActionEnum,
  UISortDirectionEnum,
  UIViewModeEnum
} from '../../global/interface/data.enums';
import { ButtonEventI } from '../button/button.component';

export interface ToolbarValueEventI {
  data: datasGlobalI;
  value: unknown;
}
export type ToolbarCommunicationAction =
  | 'messages'
  | 'notifications';

export interface ToolbarCommunicationEventI {
  action: ToolbarCommunicationAction;
}
export interface ToolbarFilterEventI
extends ToolbarValueEventI {
  values: Record<string, unknown>;
}

export interface ToolbarSortEventI {
  data: datasGlobalI;
  direction: UISortDirectionEnum;
}

export interface ToolbarViewEventI
extends ToolbarValueEventI {}

@Component({
  selector: 'pus-toolbar',
  standalone: false,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent
implements OnChanges, OnDestroy {
  @Input({ required: true })
  data!: datasGlobalI;

  @Output()
  readonly buttonClick =
    new EventEmitter<ButtonEventI>();

  @Output()
  readonly backClick =
    new EventEmitter<Event>();

  @Output()
  readonly searchChange =
    new EventEmitter<ToolbarValueEventI>();

  @Output()
  readonly searchSubmit =
    new EventEmitter<ToolbarValueEventI>();

  @Output()
  readonly filterChange =
    new EventEmitter<ToolbarFilterEventI>();

  @Output()
  readonly filtersChange =
    new EventEmitter<Record<string, unknown>>();

  @Output()
  readonly sortChange =
    new EventEmitter<ToolbarSortEventI>();

  @Output()
  readonly viewChange =
    new EventEmitter<ToolbarViewEventI>();

  readonly SortDirection = UISortDirectionEnum;
@Input()
unreadMessages = 0;

@Input()
unreadNotifications = 0;

@Output()
readonly communicationClick =
  new EventEmitter<ToolbarCommunicationEventI>();

openMessages(): void {
  if (this.locked) {
    return;
  }

  this.communicationClick.emit({
    action: 'messages'
  });
}

openNotifications(): void {
  if (this.locked) {
    return;
  }

  this.communicationClick.emit({
    action: 'notifications'
  });
}
  searchValue = '';
  filterValues: Record<string, unknown> = {};

  visibleInputs: datasGlobalI[] = [];
  filters: datasGlobalI[] = [];
  sorts: datasGlobalI[] = [];
  views: datasGlobalI[] = [];
  actionButtons: datasGlobalI[] = [];

  searchInput?: datasGlobalI;
  selectedSort?: datasGlobalI;
  selectedView?: datasGlobalI;

  sortDirection = UISortDirectionEnum.Asc;

  private searchTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.initialize();
    }
  }

  ngOnDestroy(): void {
    this.clearSearchTimer();
  }

  get title(): string {
    return (
      this.data?.label?.trim() ||
      this.data?.name?.trim() ||
      ''
    );
  }

  get description(): string {
    return this.data?.description?.trim() ?? '';
  }

  get icon(): string | undefined {
    return this.data?.configurations?.icon;
  }

  get disabled(): boolean {
    return this.data?.controls?.disabled === true;
  }

  get loading(): boolean {
    return this.data?.controls?.loading === true;
  }

  get locked(): boolean {
    return this.disabled || this.loading;
  }

  get showBack(): boolean {
    return this.data?.controls?.showBack === true;
  }

  get count(): number | undefined {
    return this.data?.configurations?.count;
  }

  get selectedCount(): number {
    const value =
      this.data?.configurations?.selectedCount;

    return typeof value === 'number' &&
      Number.isFinite(value)
      ? Math.max(0, value)
      : 0;
  }

  get hasSecondaryRow(): boolean {
    return (
      this.filters.length > 0 ||
      this.sorts.length > 0
    );
  }

  get searchPlaceholder(): string {
    return (
      this.searchInput?.configurations
        ?.placeholder?.trim() ||
      'Rechercher...'
    );
  }

  get searchDelay(): number {
    const value =
      this.searchInput?.configurations?.debounce;

    return typeof value === 'number' &&
      Number.isFinite(value)
      ? Math.max(0, value)
      : 300;
  }

  getViewIcon(view: datasGlobalI): string {
    if (view.configurations?.icon) {
      return view.configurations.icon;
    }

    switch (view.configurations?.viewMode) {
      case UIViewModeEnum.Grid:
        return 'pi pi-th-large';

      case UIViewModeEnum.List:
        return 'pi pi-list';

      case UIViewModeEnum.Table:
      default:
        return 'pi pi-table';
    }
  }

  getViewLabel(view: datasGlobalI): string {
    return (
      view.label?.trim() ||
      view.name?.trim() ||
      view.description?.trim() ||
      'Changer de vue'
    );
  }

  isHidden(data: datasGlobalI): boolean {
    return data.controls?.hidden === true;
  }

  isDisabled(data: datasGlobalI): boolean {
    return (
      this.locked ||
      data.controls?.disabled === true
    );
  }

  onBack(event: Event): void {
    if (this.locked) {
      return;
    }

    this.backClick.emit(event);
  }

  onSearchInput(event: Event): void {
    const search = this.searchInput;

    if (!search || this.isDisabled(search)) {
      return;
    }

    const target =
      event.target as HTMLInputElement | null;

    this.searchValue = target?.value ?? '';

    this.clearSearchTimer();

    const value = this.searchValue;

    this.searchTimer = setTimeout(() => {
      this.searchTimer = undefined;

      this.searchChange.emit({
        data: search,
        value
      });
    }, this.searchDelay);
  }

  onSearchSubmit(): void {
    const search = this.searchInput;

    if (!search || this.isDisabled(search)) {
      return;
    }

    this.clearSearchTimer();

    this.searchValue =
      this.searchValue.trim();

    const event: ToolbarValueEventI = {
      data: search,
      value: this.searchValue
    };

    this.searchChange.emit(event);
    this.searchSubmit.emit(event);
  }

  clearSearch(): void {
    const search = this.searchInput;

    if (!search || this.isDisabled(search)) {
      return;
    }

    this.clearSearchTimer();

    this.searchValue = '';

    const event: ToolbarValueEventI = {
      data: search,
      value: ''
    };

    this.searchChange.emit(event);
    this.searchSubmit.emit(event);
  }

  onFilterChange(
    filter: datasGlobalI,
    value: unknown
  ): void {
    if (this.isDisabled(filter)) {
      return;
    }

    this.filterValues = {
      ...this.filterValues,
      [filter.dataKey]: value
    };

    const values = {
      ...this.filterValues
    };

    this.filterChange.emit({
      data: filter,
      value,
      values
    });

    this.filtersChange.emit(values);
  }

  clearFilters(): void {
    if (this.locked) {
      return;
    }

    this.filterValues =
      Object.fromEntries(
        this.filters.map(filter => [
          filter.dataKey,
          null
        ])
      );

    this.filtersChange.emit({
      ...this.filterValues
    });
  }

  onSortChange(
    sort: datasGlobalI | null | undefined
  ): void {
    if (!sort || this.isDisabled(sort)) {
      return;
    }

    this.selectedSort = sort;

    this.sortDirection =
      sort.configurations?.sortDirection ??
      UISortDirectionEnum.Asc;

    this.emitSort();
  }

  toggleSortDirection(): void {
    if (
      !this.selectedSort ||
      this.isDisabled(this.selectedSort)
    ) {
      return;
    }

    this.sortDirection =
      this.sortDirection ===
      UISortDirectionEnum.Asc
        ? UISortDirectionEnum.Desc
        : UISortDirectionEnum.Asc;

    this.emitSort();
  }

  setView(view: datasGlobalI): void {
    if (this.isDisabled(view)) {
      return;
    }

    if (this.selectedView?._id === view._id) {
      return;
    }

    this.selectedView = view;

    this.viewChange.emit({
      data: view,
      value:
        view.configurations?.viewMode ??
        view.value ??
        view.dataKey
    });
  }

  onButtonClick(event: ButtonEventI): void {
    if (this.locked) {
      return;
    }

    this.buttonClick.emit(event);
  }

  private initialize(): void {
    this.clearSearchTimer();

    if (!this.data) {
      this.resetState();
      return;
    }

    this.visibleInputs =
      (this.data.inputs ?? []).filter(
        input => !this.isHidden(input)
      );

    this.searchInput =
      this.visibleInputs.find(
        input =>
          input.configurations?.action ===
          UIActionEnum.Search
      );

    this.filters =
      this.visibleInputs.filter(
        input =>
          input.configurations?.action ===
          UIActionEnum.Filter
      );

    this.sorts =
      this.visibleInputs.filter(
        input =>
          input.configurations?.action ===
          UIActionEnum.Sort
      );

    this.views =
      this.visibleInputs.filter(
        input =>
          input.configurations?.action ===
          UIActionEnum.View
      );

    this.searchValue =
      this.normalizeSearchValue(
        this.searchInput?.value ??
        this.searchInput?.default
      );

    this.filterValues =
      Object.fromEntries(
        this.filters.map(filter => [
          filter.dataKey,
          filter.value !== undefined
            ? filter.value
            : filter.default ?? null
        ])
      );

    this.selectedSort =
      this.sorts.find(
        sort =>
          sort.controls?.selected === true
      ) ??
      this.sorts[0];

    this.sortDirection =
      this.selectedSort?.configurations
        ?.sortDirection ??
      UISortDirectionEnum.Asc;

    this.selectedView =
      this.views.find(
        view =>
          view.controls?.selected === true
      ) ??
      this.views[0];

    this.actionButtons =
      this.buildActionButtons();
  }

  private buildActionButtons(): datasGlobalI[] {
    return (this.data.buttons ?? [])
      .filter(button => {
        if (this.isHidden(button)) {
          return false;
        }

        if (
          button.controls?.selectionOnly === true
        ) {
          return this.selectedCount > 0;
        }

        return true;
      })
      .map(button =>
        this.locked
          ? this.disableButtonTree(button)
          : button
      );
  }

  private disableButtonTree(
    button: datasGlobalI
  ): datasGlobalI {
    return {
      ...button,
      controls: {
        ...button.controls,
        disabled: true
      },
      buttons: button.buttons?.map(child =>
        this.disableButtonTree(child)
      )
    };
  }

  private emitSort(): void {
    if (!this.selectedSort) {
      return;
    }

    this.sortChange.emit({
      data: this.selectedSort,
      direction: this.sortDirection
    });
  }

  private normalizeSearchValue(
    value: unknown
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  private clearSearchTimer(): void {
    if (this.searchTimer !== undefined) {
      clearTimeout(this.searchTimer);
      this.searchTimer = undefined;
    }
  }

  private resetState(): void {
    this.searchValue = '';
    this.filterValues = {};
    this.visibleInputs = [];
    this.filters = [];
    this.sorts = [];
    this.views = [];
    this.actionButtons = [];
    this.searchInput = undefined;
    this.selectedSort = undefined;
    this.selectedView = undefined;
    this.sortDirection =
      UISortDirectionEnum.Asc;
  }
}