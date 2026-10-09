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

import {
  InputsSelectionsComponent
} from './inputs-selections.component';
import {
  PrimerModule
} from '../../../primer.module';
import {
  datasGlobalI
} from '../../../global/interface/data.interface';
import {
  dataTypeE,
  UIComponentEnum
} from '../../../global/interface/data.enums';
import {
  InputGroupEnum,
  InputTypeEnum
} from '../../../global/interface/input-form.enum';

describe('InputsSelectionsComponent', () => {
  let component:
    InputsSelectionsComponent;

  let fixture:
    ComponentFixture<InputsSelectionsComponent>;

  const dataKey: datasGlobalI = {
    _id: 'input-status',
    name: 'Statut',
    description: 'Statut utilisateur',
    dataType: dataTypeE.String,
    dataKey: 'status',
    uiComponent: UIComponentEnum.Input,
    inputGroup: InputGroupEnum.Selection,
    inputType: InputTypeEnum.Select,
    controls: {},
    configurations: {
      placeholder: 'Choisir un statut'
    },
    resources: [
      {
        name: 'Actif',
        label: 'Actif',
        value: 'active'
      },
      {
        name: 'Inactif',
        label: 'Inactif',
        value: 'inactive'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InputsSelectionsComponent
      ],
      imports: [
        ReactiveFormsModule,
        PrimerModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      InputsSelectionsComponent
    );

    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'dataKey',
      dataKey
    );

    fixture.componentRef.setInput(
      'control',
      new FormControl(null)
    );

    fixture.componentRef.setInput(
      'submitted',
      false
    );

    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });

  it('normalise toutes les options', () => {
    expect(
      component.normalizedOptions.length
    ).toBe(2);

    expect(
      component.normalizedOptions[0].label
    ).toBe('Actif');

    expect(
      component.normalizedOptions[0].value
    ).toBe('active');
  });

  it('initialise les suggestions', () => {
    expect(
      component.suggestions.length
    ).toBe(2);
  });

  it('filtre les suggestions', () => {
    component.search({
      query: 'act'
    });

    expect(
      component.suggestions.length
    ).toBe(2);

    component.search({
      query: 'inact'
    });

    expect(
      component.suggestions.length
    ).toBe(1);

    expect(
      component.suggestions[0].value
    ).toBe('inactive');
  });

  it('construit les options TreeNode', () => {
    expect(
      component.treeOptions.length
    ).toBe(2);

    expect(
      component.treeOptions[0].label
    ).toBe('Actif');

    expect(
      component.treeOptions[0].data
    ).toBe('active');
  });
});