import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  NO_ERRORS_SCHEMA
} from '@angular/core';
import {
  ReactiveFormsModule
} from '@angular/forms';
import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations';

import { PrimerModule } from '../../primer.module';
import {
  FormsComponent
} from './forms.component';
import { dataTypeE, UIComponentEnum } from '../../global/interface/data.enums';
import { InputGroupEnum, InputTypeEnum } from '../../global/interface/input-form.enum';

describe('FormsComponent', () => {
  let component: FormsComponent;
  let fixture:
    ComponentFixture<FormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        FormsComponent
      ],
      imports: [
        ReactiveFormsModule,
        PrimerModule,
        NoopAnimationsModule
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      FormsComponent
    );

    component = fixture.componentInstance;
    component.dataKeys = [];
    component.initialValue = {};

    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });

  it('construit un formulaire vide', () => {
    expect(
      Object.keys(component.form.controls)
    ).toEqual([]);
  });

  it('construit un contrôle média', () => {
  component.dataKeys = [
    {
      _id: 'profile_photo',
      name: 'Photo',
      description: 'Photo de profil',
      dataType: dataTypeE.Mixed,
      dataKey: 'photo',
      uiComponent: UIComponentEnum.Input,
      inputGroup: InputGroupEnum.Media,
      inputType: InputTypeEnum.Image,
      controls: {
        required: true,
        multiple: false
      },
      limits: {
        maxFileSize: 5_000_000,
        maxFiles: 1,
        acceptedFormats: [
          'image/jpeg',
          'image/png'
        ]
      }
    }
  ];

  component.ngOnChanges({
    dataKeys: {
      previousValue: [],
      currentValue: component.dataKeys,
      firstChange: false,
      isFirstChange: () => false
    }
  });

  expect(
    component.form.controls['photo']
  ).toBeTruthy();

  expect(
    component.form.controls['photo'].invalid
  ).toBeTrue();
});



});