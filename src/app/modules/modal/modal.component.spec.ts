import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  NO_ERRORS_SCHEMA,
  SimpleChange
} from '@angular/core';
import {
  ReactiveFormsModule
} from '@angular/forms';
import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations';

import {
  PrimerModule
} from '../../primer.module';
import {
  dataTypeE,
  UIComponentEnum,
  UIPresentationModeEnum,
  UIRequestStatusEnum
} from '../../global/interface/data.enums';
import {
  datasGlobalI
} from '../../global/interface/data.interface';
import {
  FormSubmitInterface
} from '../../global/interface/input-form.interface';
import {
  UIRequestStateI
} from '../../global/interface/ui-runtime.interface';
import {
  ModalComponent
} from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture:
    ComponentFixture<ModalComponent>;

  const modalData: datasGlobalI = {
    _id: 'create_user',
    name: 'Créer un utilisateur',
    label: 'Nouvel utilisateur',
    description:
      'Création d’un utilisateur',
    dataType: dataTypeE.Object,
    dataKey: 'createUser',
    uiComponent: UIComponentEnum.Form,

    controls: {
      closable: true,
      closeOnEscape: true,
      dismissibleMask: false,
      lockWhileSubmitting: true,
      waitForServerResponse: true,
      closeOnSuccess: true,
      confirmPassword: true,
      showFeedback: true
    },

    configurations: {
      presentationMode:
        UIPresentationModeEnum.Modal,
      modalTitle:
        'Créer un utilisateur',
      modalWidth: '36rem'
    },

    inputs: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ModalComponent
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

    fixture =
      TestBed.createComponent(
        ModalComponent
      );

    component = fixture.componentInstance;
    component.data = modalData;
    component.visible = true;
    component.requestState = {
      status: UIRequestStatusEnum.Idle
    };

    component.ngOnChanges({
      data: new SimpleChange(
        undefined,
        modalData,
        true
      ),
      visible: new SimpleChange(
        false,
        true,
        true
      )
    });

    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });

  it('reconnaît automatiquement un formulaire', () => {
    expect(
      component.isAutomaticForm
    ).toBeTrue();
  });

  it('exige automatiquement le mot de passe', () => {
    expect(
      component.requiresPassword
    ).toBeTrue();

    expect(
      component.confirmPasswordControl.invalid
    ).toBeTrue();
  });

  it('ne soumet pas sans mot de passe', () => {
    spyOn(
      component.submitRequest,
      'emit'
    );

    component.onFormSubmit({
      value: {
        name: 'Jean'
      },
      rawValue: {
        name: 'Jean'
      },
      valid: true,
      status: 'VALID'
    });

    expect(
      component.submitRequest.emit
    ).not.toHaveBeenCalled();

    expect(
      component.confirmPasswordControl.touched
    ).toBeTrue();
  });

  it('sépare les données et la confirmation', () => {
    spyOn(
      component.submitRequest,
      'emit'
    );

    component.confirmPasswordControl
      .setValue('secret');

    const formEvent: FormSubmitInterface = {
      value: {
        name: 'Jean'
      },
      rawValue: {
        name: 'Jean',
        email: 'jean@peka.com'
      },
      valid: true,
      status: 'VALID'
    };

    component.onFormSubmit(formEvent);

    expect(
      component.submitRequest.emit
    ).toHaveBeenCalledWith({
      definition: modalData,
      value: {
        name: 'Jean',
        email: 'jean@peka.com'
      },
      confirmation: {
        password: 'secret'
      }
    });
  });

  it('verrouille le modal pendant la requête', () => {
    component.requestState = {
      status:
        UIRequestStatusEnum.Submitting
    };

    expect(component.locked).toBeTrue();
    expect(component.closable).toBeFalse();
    expect(
      component.closeOnEscape
    ).toBeFalse();
    expect(
      component.dismissibleMask
    ).toBeFalse();
  });

  it('refuse la fermeture pendant la requête', () => {
    spyOn(
      component.visibleChange,
      'emit'
    );

    component.requestState = {
      status:
        UIRequestStatusEnum.Submitting
    };

    component.requestClose('button');

    expect(
      component.visibleChange.emit
    ).not.toHaveBeenCalled();
  });

  it('reste ouvert après une erreur serveur', () => {
    spyOn(
      component.visibleChange,
      'emit'
    );

    component.confirmPasswordControl
      .setValue('secret');

    const previous:
      UIRequestStateI = {
      status:
        UIRequestStatusEnum.Submitting
    };

    const current:
      UIRequestStateI = {
      status:
        UIRequestStatusEnum.Error,
      feedback: {
        severity: 'error',
        message:
          'Mot de passe incorrect.'
      }
    };

    component.requestState = previous;

    component.ngOnChanges({
      requestState: new SimpleChange(
        {
          status:
            UIRequestStatusEnum.Idle
        },
        previous,
        false
      )
    });

    component.requestState = current;

    component.ngOnChanges({
      requestState: new SimpleChange(
        previous,
        current,
        false
      )
    });

    expect(
      component.visibleChange.emit
    ).not.toHaveBeenCalled();

    expect(
      component.confirmPasswordControl.value
    ).toBe('');

    expect(component.failed).toBeTrue();
  });

  it('désactive le contrôle du mot de passe pendant la requête', () => {
  const previous: UIRequestStateI = {
    status: UIRequestStatusEnum.Idle
  };

  const current: UIRequestStateI = {
    status: UIRequestStatusEnum.Submitting
  };

  component.requestState = current;

  component.ngOnChanges({
    requestState: new SimpleChange(
      previous,
      current,
      false
    )
  });

  expect(
    component.confirmPasswordControl.disabled
  ).toBeTrue();
});

it('réactive le contrôle après une erreur serveur', () => {
  component.requestState = {
    status: UIRequestStatusEnum.Submitting
  };

  component.ngOnChanges({
    requestState: new SimpleChange(
      {
        status: UIRequestStatusEnum.Idle
      },
      component.requestState,
      false
    )
  });

  const previous = component.requestState;

  component.requestState = {
    status: UIRequestStatusEnum.Error,
    feedback: {
      severity: 'error',
      message: 'Mot de passe incorrect.'
    }
  };

  component.ngOnChanges({
    requestState: new SimpleChange(
      previous,
      component.requestState,
      false
    )
  });

  expect(
    component.confirmPasswordControl.enabled
  ).toBeTrue();
});

  it('se ferme après un succès serveur', () => {
    spyOn(
      component.visibleChange,
      'emit'
    );

    const previous:
      UIRequestStateI = {
      status:
        UIRequestStatusEnum.Submitting
    };

    const current:
      UIRequestStateI = {
      status:
        UIRequestStatusEnum.Success,
      feedback: {
        severity: 'success',
        message:
          'Utilisateur créé.'
      }
    };

    component.requestState = previous;

    component.ngOnChanges({
      requestState: new SimpleChange(
        {
          status:
            UIRequestStatusEnum.Idle
        },
        previous,
        false
      )
    });

    component.requestState = current;

    component.ngOnChanges({
      requestState: new SimpleChange(
        previous,
        current,
        false
      )
    });

    expect(
      component.visibleChange.emit
    ).toHaveBeenCalledWith(false);
  });

  it('autorise une fermeture normale', () => {
    spyOn(
      component.visibleChange,
      'emit'
    );

    component.requestClose('button');

    expect(
      component.visibleChange.emit
    ).toHaveBeenCalledWith(false);
  });
});