import { FormControlStatus } from '@angular/forms';
import { datasGlobalI } from './data.interface';

export type FormValue = Record<string, unknown>;

export interface InputChangeInterface {
  dataKey: datasGlobalI;
  key: string;
  value: unknown;
  valid: boolean;
  source: 'change' | 'blur';
}

export interface FormChangeInterface {
  value: FormValue;
  valid: boolean;
  status: FormControlStatus;
}

export interface FormSubmitInterface extends FormChangeInterface {
  rawValue: FormValue;
}
