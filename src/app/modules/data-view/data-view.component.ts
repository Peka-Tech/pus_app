import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { datasGlobalI } from '../../global/interface/data.interface';
import { UIViewModeEnum } from '../../global/interface/data.enums';
import { ButtonEventI } from '../button/button.component';

export type DataResource =
  Record<string, unknown>;

export interface DataViewRowEventI {
  data: datasGlobalI;
  resource: DataResource;
  event: Event;
}

export interface DataViewEventI {
  data: datasGlobalI;
  event: unknown;
}

export interface DataViewButtonEventI {
  button: datasGlobalI;
  resource: DataResource;
  event?: Event;
}

@Component({
  selector: 'pus-data-view',
  standalone: false,
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataViewComponent
implements OnChanges {
  @Input({ required: true })
  data!: datasGlobalI;

  @Output()
  readonly rowClick =
    new EventEmitter<DataViewRowEventI>();

  @Output()
  readonly rowDoubleClick =
    new EventEmitter<DataViewRowEventI>();

  @Output()
  readonly selectionChange =
    new EventEmitter<DataResource[]>();

  @Output()
  readonly pageChange =
    new EventEmitter<DataViewEventI>();

  @Output()
  readonly sortChange =
    new EventEmitter<DataViewEventI>();

  @Output()
  readonly buttonClick =
    new EventEmitter<DataViewButtonEventI>();

  resources: DataResource[] = [];
  columns: datasGlobalI[] = [];
  buttons: datasGlobalI[] = [];
  actionButtons: datasGlobalI[] = [];
  selection: DataResource[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.initialize();
    }
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

  get selectable(): boolean {
    return (
      !this.locked &&
      this.data?.controls?.selectable === true
    );
  }

  get multiple(): boolean {
    return this.data?.controls?.multiple === true;
  }

  get paginator(): boolean {
    return this.data?.controls?.paginator === true;
  }

  get lazy(): boolean {
    return this.data?.controls?.lazy === true;
  }

  get stripedRows(): boolean {
    return (
      this.data?.controls?.stripedRows === true
    );
  }

  get showGridlines(): boolean {
    return (
      this.data?.controls?.showGridlines === true
    );
  }

  get hoverable(): boolean {
    return this.data?.controls?.hoverable !== false;
  }

  get resizableColumns(): boolean {
    return (
      this.data?.controls?.resizable === true
    );
  }

  get reorderableColumns(): boolean {
    return (
      this.data?.controls?.reorderable === true
    );
  }

  get viewMode(): UIViewModeEnum {
    return (
      this.data?.configurations?.viewMode ??
      UIViewModeEnum.Table
    );
  }

  get isTable(): boolean {
    return this.viewMode === UIViewModeEnum.Table;
  }

  get isList(): boolean {
    return this.viewMode === UIViewModeEnum.List;
  }

  get isGrid(): boolean {
    return this.viewMode === UIViewModeEnum.Grid;
  }

  get pageSize(): number {
    const value =
      this.data?.configurations?.pageSize;

    return this.toPositiveInteger(value, 10);
  }

  get pageIndex(): number {
    const value =
      this.data?.configurations?.pageIndex;

    return this.toNonNegativeInteger(value, 0);
  }

  get firstRecord(): number {
    return this.pageIndex * this.pageSize;
  }

  get totalRecords(): number {
    const value =
      this.data?.configurations?.totalRecords;

    return this.toNonNegativeInteger(
      value,
      this.resources.length
    );
  }

  get rowsPerPageOptions(): number[] {
    const values =
      this.data?.configurations
        ?.rowsPerPageOptions;

    if (!Array.isArray(values)) {
      return [10, 25, 50, 100];
    }

    const normalized = [
      ...new Set(
        values
          .map(value =>
            this.toPositiveInteger(value, 0)
          )
          .filter(value => value > 0)
      )
    ].sort((a, b) => a - b);

    return normalized.length > 0
      ? normalized
      : [10, 25, 50, 100];
  }

  get trackBy(): string {
    return (
      this.data?.configurations?.trackBy
        ?.trim() ||
      '_id'
    );
  }

  isHidden(data: datasGlobalI): boolean {
    return data.controls?.hidden === true;
  }

  isSortable(column: datasGlobalI): boolean {
    return (
      !this.locked &&
      column.controls?.sortable === true
    );
  }

  getColumnLabel(
    column: datasGlobalI
  ): string {
    return (
      column.label?.trim() ||
      column.name?.trim() ||
      column.dataKey
    );
  }

  getColumnIcon(
    column: datasGlobalI
  ): string | undefined {
    return column.configurations?.icon;
  }

  getCellValue(
    resource: DataResource,
    column: datasGlobalI
  ): string {
    const value = this.resolvePath(
      resource,
      column.dataKey
    );

    if (value === null || value === undefined) {
      return '—';
    }

    const prefix =
      column.configurations?.prefix ?? '';

    const suffix =
      column.configurations?.suffix ?? '';

    return `${prefix}${this.formatValue(value)}${suffix}`;
  }

  isSelected(resource: DataResource): boolean {
    const key = this.getResourceKey(resource);

    return this.selection.some(
      item =>
        this.getResourceKey(item) === key
    );
  }

  toggleSelection(
    resource: DataResource
  ): void {
    if (!this.selectable) {
      return;
    }

    const key = this.getResourceKey(resource);

    if (this.multiple) {
      this.selection =
        this.isSelected(resource)
          ? this.selection.filter(
              item =>
                this.getResourceKey(item) !== key
            )
          : [...this.selection, resource];
    } else {
      this.selection =
        this.isSelected(resource)
          ? []
          : [resource];
    }

    this.emitSelection();
  }

  onTableSelectionChange(
    value:
      | DataResource
      | DataResource[]
      | null
      | undefined
  ): void {
    if (!this.selectable) {
      return;
    }

    if (Array.isArray(value)) {
      this.selection = [...value];
    } else {
      this.selection = value ? [value] : [];
    }

    this.emitSelection();
  }

  onRowClick(
    resource: DataResource,
    event: Event,
    manageSelection = false
  ): void {
    if (this.locked) {
      return;
    }

    /*
     * PrimeNG gère déjà la sélection du tableau.
     * manageSelection vaut true uniquement pour
     * les modes liste et grille.
     */
    if (manageSelection && this.selectable) {
      this.toggleSelection(resource);
    }

    this.rowClick.emit({
      data: this.data,
      resource,
      event
    });
  }

  onRowDoubleClick(
    resource: DataResource,
    event: Event
  ): void {
    if (this.locked) {
      return;
    }

    this.rowDoubleClick.emit({
      data: this.data,
      resource,
      event
    });
  }

  onPage(event: unknown): void {
    if (this.locked) {
      return;
    }

    this.pageChange.emit({
      data: this.data,
      event
    });
  }

  onSort(event: unknown): void {
    if (this.locked) {
      return;
    }

    this.sortChange.emit({
      data: this.data,
      event
    });
  }

  onButtonClick(
    event: ButtonEventI,
    resource: DataResource
  ): void {
    if (this.locked) {
      return;
    }

    this.buttonClick.emit({
      button: event.button,
      resource,
      event: event.event
    });
  }

  trackResource(
    resource: DataResource
  ): unknown {
    return this.getResourceKey(resource);
  }

  private initialize(): void {
    this.selection = [];

    if (!this.data) {
      this.resources = [];
      this.columns = [];
      this.buttons = [];
      this.actionButtons = [];
      return;
    }

    this.resources =
      (this.data.resources ?? []).filter(
        this.isRecord
      );

    this.columns =
      (this.data.columns ?? []).filter(
        column => !this.isHidden(column)
      );

    this.buttons =
      (this.data.buttons ?? []).filter(
        button => !this.isHidden(button)
      );

    this.actionButtons =
      this.locked
        ? this.buttons.map(button =>
            this.disableButtonTree(button)
          )
        : [...this.buttons];
  }

  private emitSelection(): void {
    this.selectionChange.emit([
      ...this.selection
    ]);
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

  private getResourceKey(
    resource: DataResource
  ): unknown {
    const key = this.resolvePath(
      resource,
      this.trackBy
    );

    /*
     * Si la clé est absente, l’identité de l’objet
     * empêche plusieurs ressources d’être considérées
     * comme identiques.
     */
    return key ?? resource;
  }

  private resolvePath(
    object: DataResource,
    path: string
  ): unknown {
    if (!path) {
      return undefined;
    }

    return path
      .split('.')
      .reduce<unknown>((value, key) => {
        if (
          value === null ||
          value === undefined ||
          typeof value !== 'object'
        ) {
          return undefined;
        }

        return (
          value as Record<string, unknown>
        )[key];
      }, object);
  }

  private formatValue(value: unknown): string {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        return 'Date invalide';
      }

      return new Intl.DateTimeFormat(
        'fr-FR',
        {
          dateStyle: 'short',
          timeStyle: 'short'
        }
      ).format(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }

    if (Array.isArray(value)) {
      return value
        .map(item => this.formatValue(item))
        .join(', ');
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }

    return String(value);
  }

  private toPositiveInteger(
    value: unknown,
    fallback: number
  ): number {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      return fallback;
    }

    const normalized = Math.floor(value);

    return normalized > 0
      ? normalized
      : fallback;
  }

  private toNonNegativeInteger(
    value: unknown,
    fallback: number
  ): number {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      return fallback;
    }

    return Math.max(0, Math.floor(value));
  }

  private readonly isRecord = (
    value: unknown
  ): value is DataResource =>
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value);
}