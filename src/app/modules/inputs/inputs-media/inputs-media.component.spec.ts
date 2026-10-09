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
import { dataTypeE, UIComponentEnum } from '../../../global/interface/data.enums';
import {
  InputGroupEnum,
  InputTypeEnum
} from '../../../global/interface/input-form.enum';
import {
  emptyMediaValue
} from '../../../global/interface/ui-runtime.interface';
import {
  InputsMediaComponent
} from './inputs-media.component';

describe('InputsMediaComponent', () => {
  let component: InputsMediaComponent;
  let fixture:
    ComponentFixture<InputsMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InputsMediaComponent
      ],
      imports: [
        ReactiveFormsModule,
        PrimerModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      InputsMediaComponent
    );

    component = fixture.componentInstance;

    component.dataKey = {
      _id: 'photo',
      name: 'Photo',
      description: 'Photo de profil',
      dataType: dataTypeE.Mixed,
      dataKey: 'photo',
      uiComponent: UIComponentEnum.Input,
      inputGroup: InputGroupEnum.Media,
      inputType: InputTypeEnum.Image,
      controls: {
        multiple: false,
        preview: true,
        allowRemove: true,
        showClear: true
      },
      limits: {
        maxFileSize: 5_000_000,
        maxFiles: 1,
        acceptedFormats: [
          'image/jpeg',
          'image/png'
        ]
      }
    };

    component.control =
      new FormControl(emptyMediaValue());

    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });

  it('accepte une image autorisée', () => {
    const file = new File(
      ['photo'],
      'photo.png',
      { type: 'image/png' }
    );

    const input =
      document.createElement('input');

    Object.defineProperty(input, 'files', {
      value: [file]
    });

    component.onFileSelection({
      target: input
    } as unknown as Event);

    expect(
      component.currentValue().files
    ).toEqual([file]);

    expect(component.localError).toBe('');
  });

  it('refuse un format interdit', () => {
    const file = new File(
      ['document'],
      'document.pdf',
      { type: 'application/pdf' }
    );

    const input =
      document.createElement('input');

    Object.defineProperty(input, 'files', {
      value: [file]
    });

    component.onFileSelection({
      target: input
    } as unknown as Event);

    expect(
      component.currentValue().files.length
    ).toBe(0);

    expect(component.localError)
      .toContain('format non autorisé');
  });

  it('retire un fichier sélectionné', () => {
    const file = new File(
      ['photo'],
      'photo.png',
      { type: 'image/png' }
    );

    component.control.setValue({
      files: [file],
      existing: [],
      removed: []
    });

    component.removeFile(file);

    expect(
      component.currentValue().files
    ).toEqual([]);
  });

  it('déplace un média existant vers removed', () => {
    const resource = {
      id: 'media-1',
      url: '/media/photo.png',
      name: 'photo.png'
    };

    component.control.setValue({
      files: [],
      existing: [resource],
      removed: []
    });

    component.removeExisting(resource);

    expect(
      component.currentValue().existing
    ).toEqual([]);

    expect(
      component.currentValue().removed
    ).toEqual([resource]);
  });
});