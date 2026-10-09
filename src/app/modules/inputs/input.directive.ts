import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  dataConfigurationsI,
  dataControlI,
  dataLimitI,
  datasGlobalI,
} from '../../global/interface/data.interface';
import { InputChangeInterface } from '../../global/interface/input-form.interface';

@Directive()
export abstract class InputBase implements OnChanges, OnDestroy {
  @Input({ required: true }) dataKey!: datasGlobalI;
  @Input({ required: true }) control!: FormControl;
  @Input() submitted = false;

  @Output() inputChange = new EventEmitter<InputChangeInterface>();
  @Output() inputBlur = new EventEmitter<InputChangeInterface>();

  private changeSubscription?: Subscription;

  protected constructor(protected readonly cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['control']) {
      this.changeSubscription?.unsubscribe();

      this.changeSubscription = this.control?.valueChanges.subscribe(value => {
        this.inputChange.emit(this.event(value, 'change'));
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy(): void {
    this.changeSubscription?.unsubscribe();
  }

  blur(): void {
    this.control.markAsTouched();
    this.inputBlur.emit(this.event(this.control.value, 'blur'));
  }

  get id(): string {
    return `pus-${this.dataKey.dataKey.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  }

  get config(): dataConfigurationsI {
    return this.dataKey.configurations ?? {};
  }

  get controls(): dataControlI {
    return this.dataKey.controls ?? {};
  }

  get limits(): dataLimitI {
    return this.dataKey.limits ?? {};
  }

 
  get options():Record<string,unknown>[] {
  return this.dataKey.resources??[];
}

  get invalid(): boolean {
    return this.control.invalid && (this.control.touched || this.control.dirty || this.submitted);
  }

  get errorMessage(): string {
    const errors = this.control.errors;
    if (!errors) return '';

    if (errors['required']) {
      const required = this.dataKey.controls?.required;
      return Array.isArray(required) ? required[1] : `${this.dataKey.name} est obligatoire.`;
    }

    if (errors['min']) return this.ruleMessage(this.dataKey.limits?.min, `Valeur minimale : ${errors['min'].min}.`);
    if (errors['max']) return this.ruleMessage(this.dataKey.limits?.max, `Valeur maximale : ${errors['max'].max}.`);

    if (errors['minlength'])
      return this.ruleMessage(
        this.dataKey.limits?.minLength,
        `Minimum ${errors['minlength'].requiredLength} caractères ou éléments.`
      );

    if (errors['maxlength'])
      return this.ruleMessage(
        this.dataKey.limits?.maxLength,
        `Maximum ${errors['maxlength'].requiredLength} caractères ou éléments.`
      );

    if (errors['pattern'])
      return `Le format de ${this.dataKey.name} est invalide.`;

    if (errors['minDate'])
      return this.ruleMessage(this.dataKey.limits?.min, 'La date est antérieure à la date minimale.');

    if (errors['maxDate'])
      return this.ruleMessage(this.dataKey.limits?.max, 'La date dépasse la date maximale.');

    if (errors['date']) return 'La date est invalide.';

    return `${this.dataKey.name} est invalide.`;
  }

  protected unwrap<T>(rule?: T | [T, string]): T | undefined {
    return Array.isArray(rule) ? rule[0] : rule;
  }

  private ruleMessage<T>(rule: T | [T, string] | undefined, fallback: string): string {
    return Array.isArray(rule) && typeof rule[1] === 'string' ? rule[1] : fallback;
  }

  private event(value: unknown, source: 'change' | 'blur'): InputChangeInterface {
    return {
      dataKey: this.dataKey,
      key: this.dataKey.dataKey,
      value,
      valid: this.control.valid,
      source
    };
  }
}