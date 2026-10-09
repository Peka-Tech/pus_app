import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { InputTypeEnum } from '../../../global/interface/input-form.enum';
import { InputBase } from '../input.directive';

@Component({
  selector: 'pus-inputs-conditions',
  standalone: false,
  templateUrl: './inputs-conditions.component.html',
  styleUrl: './inputs-conditions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputsConditionsComponent extends InputBase {
  readonly InputType = InputTypeEnum;

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  get min(): number {
    return Number(this.unwrap(this.dataKey.limits?.min as number | [number, string]) ?? 0);
  }

  get max(): number {
    return Number(this.unwrap(this.dataKey.limits?.max as number | [number, string]) ?? 100);
  }

  get displayValue(): string {
    return String(this.control.value ?? this.min);
  }

  setTriState(value: boolean | null): void {
    this.control.setValue(value);
    this.control.markAsDirty();
    this.control.markAsTouched();
  }
}