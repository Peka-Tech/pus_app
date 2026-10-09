import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  FormControl,
  Validators
} from '@angular/forms';

import {
  datasGlobalI
} from '../../global/interface/data.interface';
import {
  UIComponentEnum,
  UIRequestStatusEnum
} from '../../global/interface/data.enums';
import {
  FormSubmitInterface,
  FormValue
} from '../../global/interface/input-form.interface';
import {
  UIFeedbackI,
  UIRequestStateI,
  UISubmitRequestI
} from '../../global/interface/ui-runtime.interface';

export type ModalCloseSource =
  | 'button'
  | 'escape'
  | 'mask'
  | 'success'
  | 'external';

export interface ModalCloseEventI {
  source: ModalCloseSource;
  data: datasGlobalI;
}

@Component({
  selector: 'pus-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnChanges {
  @Input({ required: true })
  data!: datasGlobalI;

  @Input()
  visible = false;

  @Input()
  initialValue: FormValue = {};

  @Input()
  requestState: UIRequestStateI = {
    status: UIRequestStatusEnum.Idle
  };

  @Output()
  readonly visibleChange =
    new EventEmitter<boolean>();

  @Output()
  readonly submitRequest =
    new EventEmitter<UISubmitRequestI>();

  @Output()
  readonly closeRequest =
    new EventEmitter<ModalCloseEventI>();

  readonly UIComponent = UIComponentEnum;
  readonly RequestStatus = UIRequestStatusEnum;

  readonly confirmPasswordControl =
    new FormControl('', {
      nonNullable: true
    });

  private previousStatus =
    UIRequestStatusEnum.Idle;

  constructor(
    private readonly changeDetector:
      ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] ||
      changes['visible']
    ) {
      this.configurePasswordControl();

      if (!this.visible) {
        this.clearSensitiveData();
      }
    }

    if (changes['requestState']) {
      this.handleRequestState();
    }
  }

  get title(): string {
    return (
      this.data?.configurations
        ?.modalTitle?.trim() ||
      this.data?.label?.trim() ||
      this.data?.name?.trim() ||
      'Fenêtre'
    );
  }

  get description(): string {
    return this.data?.description?.trim() ?? '';
  }

  get dialogStyle(): Record<string, string> {
    return {
      width:
        this.data?.configurations?.modalWidth ??
        '36rem',
      maxWidth: 'calc(100vw - 1rem)'
    };
  }

  get submitting(): boolean {
    return (
      this.requestState?.status ===
      UIRequestStatusEnum.Submitting
    );
  }

  get successful(): boolean {
    return (
      this.requestState?.status ===
      UIRequestStatusEnum.Success
    );
  }

  get failed(): boolean {
    return (
      this.requestState?.status ===
      UIRequestStatusEnum.Error
    );
  }

  get locked(): boolean {
    return (
      this.submitting &&
      this.data?.controls
        ?.waitForServerResponse !== false &&
      this.data?.controls
        ?.lockWhileSubmitting !== false
    );
  }

  get closable(): boolean {
    return (
      this.data?.controls?.closable !== false &&
      !this.locked
    );
  }

  get closeOnEscape(): boolean {
    return (
      this.data?.controls?.closeOnEscape !== false &&
      !this.locked
    );
  }

  get dismissibleMask(): boolean {
    return (
      this.data?.controls
        ?.dismissibleMask === true &&
      !this.locked
    );
  }

  get requiresPassword(): boolean {
    return (
      this.data?.controls
        ?.confirmPassword === true
    );
  }

  get showFeedback(): boolean {
    return (
      this.data?.controls
        ?.showFeedback !== false &&
      Boolean(this.requestState?.feedback)
    );
  }

  get feedback(): UIFeedbackI | undefined {
    return this.requestState?.feedback;
  }

  get feedbackSeverity():
    'success' | 'info' | 'warn' | 'error' {
    switch (this.feedback?.severity) {
      case 'success':
        return 'success';

      case 'warning':
        return 'warn';

      case 'error':
        return 'error';

      case 'info':
      default:
        return 'info';
    }
  }

  get passwordInvalid(): boolean {
    return (
      this.requiresPassword &&
      this.confirmPasswordControl.invalid &&
      this.confirmPasswordControl.touched
    );
  }

  get isAutomaticForm(): boolean {
    return (
      this.data?.uiComponent ===
      UIComponentEnum.Form
    );
  }


  private synchronizePasswordState(): void {
    const shouldDisable =
      !this.requiresPassword ||
      this.locked;

    if (
      shouldDisable &&
      this.confirmPasswordControl.enabled
    ) {
      this.confirmPasswordControl.disable({
        emitEvent: false
      });

      return;
    }

    if (
      !shouldDisable &&
      this.confirmPasswordControl.disabled
    ) {
      this.confirmPasswordControl.enable({
        emitEvent: false
      });
    }
  }


  onDialogVisibleChange(
    nextVisible: boolean
  ): void {
    if (nextVisible) {
      return;
    }

    this.requestClose('external');
  }

  requestClose(
    source: ModalCloseSource = 'button'
  ): void {
    if (!this.closable) {
      return;
    }

    this.clearSensitiveData();

    this.closeRequest.emit({
      source,
      data: this.data
    });

    this.visibleChange.emit(false);
    this.changeDetector.markForCheck();
  }

  onFormSubmit(
    event: FormSubmitInterface
  ): void {
    if (this.locked || this.submitting) {
      return;
    }

    if (this.requiresPassword) {
      this.confirmPasswordControl
        .markAsTouched();

      if (
        this.confirmPasswordControl.invalid
      ) {
        this.changeDetector.markForCheck();
        return;
      }
    }

    const request:
      UISubmitRequestI = {
      definition: this.data,
      value: event.rawValue
    };

    if (this.requiresPassword) {
      request.confirmation = {
        password:
          this.confirmPasswordControl.value
      };
    }

    this.submitRequest.emit(request);
  }

private configurePasswordControl(): void {
  if (this.requiresPassword) {
    this.confirmPasswordControl.setValidators([
      Validators.required
    ]);
  } else {
    this.confirmPasswordControl.clearValidators();
  }

  this.synchronizePasswordState();

  this.confirmPasswordControl
    .updateValueAndValidity({
      emitEvent: false
    });
}

private handleRequestState(): void {
  const currentStatus =
    this.requestState?.status ??
    UIRequestStatusEnum.Idle;

  this.synchronizePasswordState();

  if (currentStatus === this.previousStatus) {
    return;
  }

  this.previousStatus = currentStatus;

  if (
    currentStatus ===
    UIRequestStatusEnum.Error
  ) {
    this.clearSensitiveData();
    this.changeDetector.markForCheck();
    return;
  }

  if (
    currentStatus ===
    UIRequestStatusEnum.Success
  ) {
    this.clearSensitiveData();

    if (
      this.data?.controls
        ?.closeOnSuccess !== false
    ) {
      this.closeRequest.emit({
        source: 'success',
        data: this.data
      });

      this.visibleChange.emit(false);
    }

    this.changeDetector.markForCheck();
  }
}


  private clearSensitiveData(): void {
    this.confirmPasswordControl.reset('', {
      emitEvent: false
    });

    this.confirmPasswordControl
      .markAsUntouched();

    this.confirmPasswordControl
      .markAsPristine();
  }
}