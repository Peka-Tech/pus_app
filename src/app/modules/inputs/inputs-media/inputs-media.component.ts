import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  AbstractControl,
  FormControl
} from '@angular/forms';

import { datasGlobalI } from '../../../global/interface/data.interface';
import { InputTypeEnum } from '../../../global/interface/input-form.enum';
import { InputChangeInterface } from '../../../global/interface/input-form.interface';
import {
  emptyMediaValue,
  InputMediaValueI,
  MediaResourceI
} from '../../../global/interface/ui-runtime.interface';

interface MediaPreviewI {
  file: File;
  url: string;
  image: boolean;
}

@Component({
  selector: 'pus-inputs-media',
  standalone: false,
  templateUrl: './inputs-media.component.html',
  styleUrl: './inputs-media.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputsMediaComponent
implements OnChanges, OnDestroy {
  @Input({ required: true })
  dataKey!: datasGlobalI;

  @Input({ required: true })
  control!: FormControl;

  @Input()
  submitted = false;

  @Output()
  readonly inputChange =
    new EventEmitter<InputChangeInterface>();

  @Output()
  readonly inputBlur =
    new EventEmitter<InputChangeInterface>();

  previews: MediaPreviewI[] = [];
  localError = '';

  constructor(
    private readonly changeDetector:
      ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['control'] ||
      changes['dataKey']
    ) {
      this.rebuildPreviews();
    }
  }

  ngOnDestroy(): void {
    this.clearPreviewUrls();
  }

  get label(): string {
    return (
      this.dataKey.label?.trim() ||
      this.dataKey.name?.trim() ||
      'Média'
    );
  }

  get accept(): string {
    const formats =
      this.dataKey.limits?.acceptedFormats ?? [];

    const extensions =
      this.dataKey.limits?.acceptedExtensions ?? [];

    return [...formats, ...extensions].join(',');
  }

  get multiple(): boolean {
    return this.dataKey.controls?.multiple === true;
  }

  get disabled(): boolean {
    return (
      this.control?.disabled === true ||
      this.dataKey.controls?.disabled === true ||
      this.dataKey.controls?.readOnly === true
    );
  }

  get required(): boolean {
    const required =
      this.dataKey.controls?.required;

    return Array.isArray(required)
      ? required[0]
      : required === true;
  }

  get capture():
    'user' | 'environment' | undefined {
    if (
      this.dataKey.controls?.captureCamera !== true
    ) {
      return undefined;
    }

    return (
      this.dataKey.configurations?.capture ??
      'environment'
    );
  }

  get showError(): boolean {
    return Boolean(
      this.localError ||
      (
        this.control?.invalid &&
        (
          this.control.touched ||
          this.submitted
        )
      )
    );
  }

  get errorMessage(): string {
    if (this.localError) {
      return this.localError;
    }

    const errors = this.control?.errors;

    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'Ce média est obligatoire.';
    }

    if (errors['mediaType']) {
      return 'Le format du fichier n’est pas autorisé.';
    }

    if (errors['mediaSize']) {
      return 'La taille du fichier n’est pas autorisée.';
    }

    if (errors['mediaCount']) {
      return 'Le nombre de fichiers n’est pas autorisé.';
    }

    return 'Le média sélectionné est invalide.';
  }

  currentValue(): InputMediaValueI {
    const value = this.control?.value;

    if (
      value &&
      typeof value === 'object' &&
      Array.isArray(value.files) &&
      Array.isArray(value.existing) &&
      Array.isArray(value.removed)
    ) {
      return value as InputMediaValueI;
    }

    return emptyMediaValue();
  }

  onFileSelection(event: Event): void {
    if (this.disabled) {
      return;
    }

    const input =
      event.target as HTMLInputElement;

    const selected =
      Array.from(input.files ?? []);

    input.value = '';

    if (selected.length === 0) {
      return;
    }

    const validation =
      this.validateFiles(selected);

    if (validation) {
      this.localError = validation;
      this.changeDetector.markForCheck();
      return;
    }

    this.localError = '';

    const current = this.currentValue();

    const files = this.multiple
      ? this.uniqueFiles([
          ...current.files,
          ...selected
        ])
      : [selected[0]];

    const next: InputMediaValueI = {
      ...current,
      files
    };

    this.setValue(next, 'change');
    this.rebuildPreviews();
  }

  removeFile(file: File): void {
    if (
      this.disabled ||
      this.dataKey.controls?.allowRemove === false
    ) {
      return;
    }

    const current = this.currentValue();

    const next: InputMediaValueI = {
      ...current,
      files: current.files.filter(
        currentFile => currentFile !== file
      )
    };

    this.setValue(next, 'change');
    this.rebuildPreviews();
  }

  removeExisting(
    resource: MediaResourceI
  ): void {
    if (
      this.disabled ||
      this.dataKey.controls?.allowRemove === false
    ) {
      return;
    }

    const current = this.currentValue();

    const next: InputMediaValueI = {
      files: current.files,
      existing: current.existing.filter(
        item => item !== resource
      ),
      removed: [
        ...current.removed,
        resource
      ]
    };

    this.setValue(next, 'change');
  }

  clear(): void {
    if (
      this.disabled ||
      this.dataKey.controls?.showClear === false
    ) {
      return;
    }

    const current = this.currentValue();

    this.setValue({
      files: [],
      existing: [],
      removed: [
        ...current.removed,
        ...current.existing
      ]
    }, 'change');

    this.rebuildPreviews();
  }

  onBlur(): void {
    this.control.markAsTouched();

    this.inputBlur.emit({
      dataKey: this.dataKey,
      key: this.dataKey.dataKey,
      value: this.control.value,
      valid: this.control.valid,
      source: 'blur'
    });
  }

  private setValue(
    value: InputMediaValueI,
    source: 'change' | 'blur'
  ): void {
    this.control.setValue(value);
    this.control.markAsDirty();
    this.control.updateValueAndValidity();

    this.inputChange.emit({
      dataKey: this.dataKey,
      key: this.dataKey.dataKey,
      value,
      valid: this.control.valid,
      source
    });

    this.changeDetector.markForCheck();
  }

  private validateFiles(
    files: readonly File[]
  ): string {
    const current = this.currentValue();

    const total = this.multiple
      ? current.files.length + files.length
      : files.length;

    const maxFiles =
      this.ruleNumber(
        this.dataKey.limits?.maxFiles
      );

    const minSize =
      this.ruleNumber(
        this.dataKey.limits?.minFileSize
      );

    const maxSize =
      this.ruleNumber(
        this.dataKey.limits?.maxFileSize
      );

    const formats =
      this.dataKey.limits?.acceptedFormats ?? [];

    const extensions =
      (
        this.dataKey.limits
          ?.acceptedExtensions ?? []
      ).map(extension =>
        extension.toLowerCase()
      );

    if (
      maxFiles !== undefined &&
      total > maxFiles
    ) {
      return `Maximum ${maxFiles} fichier(s).`;
    }

    for (const file of files) {
      if (
        minSize !== undefined &&
        file.size < minSize
      ) {
        return `${file.name} est trop petit.`;
      }

      if (
        maxSize !== undefined &&
        file.size > maxSize
      ) {
        return `${file.name} dépasse la taille autorisée.`;
      }

      if (
        formats.length > 0 &&
        !formats.includes(file.type)
      ) {
        return `${file.name} utilise un format non autorisé.`;
      }

      if (
        extensions.length > 0 &&
        !extensions.some(extension =>
          file.name.toLowerCase()
            .endsWith(extension)
        )
      ) {
        return `${file.name} utilise une extension non autorisée.`;
      }
    }

    return '';
  }

  private uniqueFiles(
    files: readonly File[]
  ): File[] {
    const keys = new Set<string>();

    return files.filter(file => {
      const key = [
        file.name,
        file.size,
        file.lastModified
      ].join(':');

      if (keys.has(key)) {
        return false;
      }

      keys.add(key);
      return true;
    });
  }

  private rebuildPreviews(): void {
    this.clearPreviewUrls();

    this.previews =
      this.currentValue().files.map(file => ({
        file,
        url: URL.createObjectURL(file),
        image:
          file.type.startsWith('image/') &&
          this.dataKey.inputType ===
            InputTypeEnum.Image
      }));

    this.changeDetector.markForCheck();
  }

  private clearPreviewUrls(): void {
    for (const preview of this.previews) {
      URL.revokeObjectURL(preview.url);
    }

    this.previews = [];
  }

  private ruleNumber(
    rule: unknown
  ): number | undefined {
    const value =
      Array.isArray(rule) ? rule[0] : rule;

    return typeof value === 'number' &&
      Number.isFinite(value)
      ? value
      : undefined;
  }
}