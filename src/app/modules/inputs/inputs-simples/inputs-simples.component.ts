import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { InputTypeEnum } from '../../../global/interface/input-form.enum';
import { InputBase } from '../input.directive';

@Component({
  selector:'pus-inputs-simples',
  standalone:false,
  templateUrl:'./inputs-simples.component.html',
  styleUrl:'./inputs-simples.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class InputsSimplesComponent extends InputBase {
  readonly InputType=InputTypeEnum;

  constructor(cdr:ChangeDetectorRef){super(cdr);}

  get min():number|undefined {
    return this.unwrap(this.dataKey.limits?.min as number|[number,string]);
  }

  get max():number|undefined {
    return this.unwrap(this.dataKey.limits?.max as number|[number,string]);
  }

  get minDate():Date|undefined {
    const value=this.unwrap(this.dataKey.limits?.min as string|Date|[string|Date,string]);
    return value?new Date(value):undefined;
  }

  get maxDate():Date|undefined {
    const value=this.unwrap(this.dataKey.limits?.max as string|Date|[string|Date,string]);
    return value?new Date(value):undefined;
  }
}