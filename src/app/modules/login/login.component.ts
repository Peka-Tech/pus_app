import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';
import {
  FormBuilder,
  Validators
} from '@angular/forms';
import {
  HttpErrorResponse
} from '@angular/common/http';
import {
  MessageService
} from 'primeng/api';

import {
  AuthService
} from '../../global/service/auth.service';
import {
  ServerResponseInterface
} from '../../global/interface/server.interface';

@Component({
  selector:'pus-login',
  standalone:false,
  templateUrl:'./login.component.html',
  styleUrl:'./login.component.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly formBuilder=
    inject(FormBuilder);

  private readonly authService=
    inject(AuthService);

  private readonly messageService=
    inject(MessageService);

  private readonly changeDetector=
    inject(ChangeDetectorRef);

  submitting=false;
  passwordVisible=false;

  readonly loginForm=
    this.formBuilder.nonNullable.group({
      login:[
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(254)
        ]
      ],
      password:[
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(256)
        ]
      ]
    });

  login_submitE():void{
    if(
      this.loginForm.invalid||
      this.submitting
    ){
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting=true;
    this.loginForm.disable();

    this.authService
      .login(this.loginForm.getRawValue())
      .subscribe({
        next:result=>{
          this.submitting=false;
          this.loginForm.enable();
          this.loginForm.reset();

          this.messageService.add({
            severity:'success',
            summary:'Connexion réussie',
            detail:`Bienvenue ${result.user.name}`,
            life:3000
          });

          this.changeDetector.markForCheck();
        },

        error:error=>{
          this.submitting=false;
          this.loginForm.enable();

          this.messageService.add({
            severity:'error',
            summary:'Connexion refusée',
            detail:this.errorMessage(error),
            life:5000
          });

          this.changeDetector.markForCheck();
        }
      });
  }

  password_toggleE():void{
    this.passwordVisible=
      !this.passwordVisible;
  }

  private errorMessage(
    error:unknown
  ):string{
    if(error instanceof HttpErrorResponse){
      const response=
        error.error as
        Partial<ServerResponseInterface>;

      return response.message??
        'Identifiants invalides.';
    }

    return error instanceof Error
      ? error.message
      : 'Impossible de joindre le serveur.';
  }
}