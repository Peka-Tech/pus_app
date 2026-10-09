import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
  Input, OnChanges, OnDestroy, Output, SimpleChanges
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { datasGlobalI } from '../../global/interface/data.interface';
import { InputGroupEnum } from '../../global/interface/input-form.enum';
import {
  FormChangeInterface, FormSubmitInterface, FormValue, InputChangeInterface
} from '../../global/interface/input-form.interface';
import { createInputControl } from './form.control.factory';

@Component({
  selector: 'pus-forms',
  standalone: false,
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsComponent implements OnChanges, OnDestroy {
  @Input() dataKeys: datasGlobalI[] = [];
  @Input() forms_datas: datasGlobalI = undefined as any;
  @Input() initialValue: FormValue = {};
  @Input() title = 'Formulaire';
  @Input() submitLabel = 'Enregistrer';
  @Input() resetLabel = 'Réinitialiser';
  @Input() showReset = true;

  @Output() formChange = new EventEmitter<FormChangeInterface>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() fieldChange = new EventEmitter<InputChangeInterface>();
  @Output() fieldBlur = new EventEmitter<InputChangeInterface>();
  @Output() formSubmit = new EventEmitter<FormSubmitInterface>();
  @Output() formReset = new EventEmitter<FormValue>();

  
  readonly InputGroup = InputGroupEnum;
  form = new FormGroup<Record<string, FormControl>>({});
  submitted = false;
  private subscription = new Subscription();

  constructor(private readonly cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataKeys']) {
      this.buildForm();
      return;
    }

    if (changes['initialValue'] && this.form) {
      this.patchInitialValue();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get visibleFields(): datasGlobalI[] {
    return this.flatten(this.dataKeys).filter(field =>
      field.inputGroup && field.inputType && !field.controls?.hidden
    );
  }

  onFieldChange(event: InputChangeInterface): void {
    this.fieldChange.emit(event);
  }

  onFieldBlur(event: InputChangeInterface): void {
    this.fieldBlur.emit(event);
  }

  submit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.cdr.markForCheck();
      return;
    }

    this.formSubmit.emit({
      value: this.form.value as FormValue,
      rawValue: this.form.getRawValue() as FormValue,
      valid: true,
      status: this.form.status
    });
  }

  reset(): void {
    this.submitted = false;

    for (const field of this.visibleFields) {
      this.form.controls[field.dataKey]?.reset(
        this.initialValue[field.dataKey] ?? createInputControl(field).value
      );
    }

    const value = this.form.getRawValue() as FormValue;
    this.formReset.emit(value);
    this.cdr.markForCheck();
  }

  private buildForm(): void {
    const previousValue = this.form?.getRawValue() ?? {};
    const controls: Record<string, FormControl> = {};

    for (const field of this.visibleFields) {
      const value = Object.prototype.hasOwnProperty.call(this.initialValue, field.dataKey)
        ? this.initialValue[field.dataKey]
        : previousValue[field.dataKey];

      controls[field.dataKey] = createInputControl(field, value);
    }

    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    this.form = new FormGroup(controls);

    this.subscription.add(this.form.valueChanges.subscribe(value => {
      this.formChange.emit({
        value: value as FormValue,
        valid: this.form.valid,
        status: this.form.status
      });
      this.cdr.markForCheck();
    }));

    this.subscription.add(this.form.statusChanges.subscribe(() => {
      this.validityChange.emit(this.form.valid);
      this.cdr.markForCheck();
    }));

    this.validityChange.emit(this.form.valid);
    this.cdr.markForCheck();
  }

  private patchInitialValue(): void {
    const knownValues: FormValue = {};

    for (const key of Object.keys(this.form.controls)) {
      if (Object.prototype.hasOwnProperty.call(this.initialValue, key)) {
        knownValues[key] = this.initialValue[key];
      }
    }

    this.form.patchValue(knownValues, { emitEvent: true });
  }

  private flatten(fields: datasGlobalI[]): datasGlobalI[] {
    return fields.flatMap(field => [
      field,
      ...(field.inputs?.length ? this.flatten(field.inputs) : [])
    ]);
  }
}