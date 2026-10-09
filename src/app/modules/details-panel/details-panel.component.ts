import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

import {
  datasGlobalI
} from '../../global/interface/data.interface';

export interface DetailsFieldI {
  key: string;
  label: string;
  icon?: string;
  value: unknown;
}

@Component({
  selector: 'pus-details-panel',
  standalone: false,
  templateUrl: './details-panel.component.html',
  styleUrl: './details-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsPanelComponent {
  @Input()
  visible = false;

  @Input()
  definition?: datasGlobalI;

  @Input()
  data: Record<string, unknown> | null = null;

  @Input()
  title = 'Détails';

  @Input()
  subtitle = '';

  @Input()
  imageUrl?: string;

  @Input()
  editable = true;

  @Input()
  deletable = false;

  @Output()
  readonly visibleChange =
    new EventEmitter<boolean>();

  @Output()
  readonly editClick =
    new EventEmitter<Record<string, unknown>>();

  @Output()
  readonly deleteClick =
    new EventEmitter<Record<string, unknown>>();

  get fields(): DetailsFieldI[] {
    if (!this.data) {
      return [];
    }

    const columns =
      this.definition?.columns?.filter(
        column =>
          column.controls?.hidden !== true
      ) ?? [];

    if (columns.length > 0) {
      return columns.map(column => ({
        key: column.dataKey,
        label:
          column.label ??
          column.name ??
          column.dataKey,
        icon:
          column.configurations?.icon,
        value: this.readPath(
          this.data!,
          column.dataKey
        )
      }));
    }

    return Object.entries(this.data)
      .filter(([key]) =>
        ![
          '_id',
          'id',
          'imageUrl',
          'photo',
          'avatar'
        ].includes(key)
      )
      .map(([key, value]) => ({
        key,
        label: this.humanize(key),
        value
      }));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) {
      this.close();
    }
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  edit(): void {
    if (this.editable && this.data) {
      this.editClick.emit(this.data);
    }
  }

  remove(): void {
    if (this.deletable && this.data) {
      this.deleteClick.emit(this.data);
    }
  }

  displayValue(value: unknown): string {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      return String(value);
    }

    if (value instanceof Date) {
      return value.toLocaleString('fr-FR');
    }

    if (Array.isArray(value)) {
      return value
        .map(item => this.displayValue(item))
        .join(', ');
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  private readPath(
    object: Record<string, unknown>,
    path: string
  ): unknown {
    return path
      .split('.')
      .reduce<unknown>((value, key) => {
        if (
          value &&
          typeof value === 'object'
        ) {
          return (
            value as Record<string, unknown>
          )[key];
        }

        return undefined;
      }, object);
  }

  private humanize(value: string): string {
    const result = value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim();

    return result
      ? result.charAt(0).toUpperCase() +
          result.slice(1)
      : value;
  }
}