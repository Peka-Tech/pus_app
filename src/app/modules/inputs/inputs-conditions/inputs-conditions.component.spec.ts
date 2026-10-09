import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';
import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations';

import { PrimerModule } from '../../../primer.module';
import {
  InputsConditionsComponent
} from './inputs-conditions.component';

import {
  dataTypeE,
  UIComponentEnum
} from '../../../global/interface/data.enums';
import {
  InputGroupEnum,
  InputTypeEnum
} from '../../../global/interface/input-form.enum';

describe('InputsConditionsComponent', () => {
  let component: InputsConditionsComponent;
  let fixture:
    ComponentFixture<InputsConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InputsConditionsComponent
      ],
      imports: [
        ReactiveFormsModule,
        PrimerModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      InputsConditionsComponent
    );

    component = fixture.componentInstance;

    component.dataKey = {
      _id: 'input-active',
      name: 'Actif',
      description: 'État actif',
      dataType: dataTypeE.Boolean,
      dataKey: 'active',
      uiComponent: UIComponentEnum.Input,
      inputGroup: InputGroupEnum.Condition,
      inputType: InputTypeEnum.ToggleSwitch,
      controls: {},
      configurations: {}
    };

    component.control =
      new FormControl(false);

    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });
});