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
  InputsSimplesComponent
} from './inputs-simples.component';

import {
  dataTypeE,
  UIComponentEnum
} from '../../../global/interface/data.enums';
import {
  InputGroupEnum,
  InputTypeEnum
} from '../../../global/interface/input-form.enum';

describe('InputsSimplesComponent', () => {
  let component: InputsSimplesComponent;
  let fixture:
    ComponentFixture<InputsSimplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InputsSimplesComponent
      ],
      imports: [
        ReactiveFormsModule,
        PrimerModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      InputsSimplesComponent
    );

    component = fixture.componentInstance;

    component.dataKey = {
      _id: 'input-name',
      name: 'Nom',
      description: 'Nom complet',
      dataType: dataTypeE.String,
      dataKey: 'name',
      uiComponent: UIComponentEnum.Input,
      inputGroup: InputGroupEnum.Simple,
      inputType: InputTypeEnum.Text,
      controls: {},
      configurations: {}
    };

    component.control =
      new FormControl('');

    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });
});