import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PrimerModule } from './primer.module'; 
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura'; 
import { InputsConditionsComponent } from './modules/inputs/inputs-conditions/inputs-conditions.component';
import { InputsSelectionsComponent } from './modules/inputs/inputs-selections/inputs-selections.component';
import { InputsSimplesComponent } from './modules/inputs/inputs-simples/inputs-simples.component';
import { FormsComponent } from './modules/forms/forms.component';
import { ListViewComponent } from './modules/list-view/list-view.component';
import { TooltipComponent } from './modules/tooltip/tooltip.component';
import { ToolbarComponent } from './modules/toolbar/toolbar.component';
import { ButtonComponent } from './modules/button/button.component';
import { FooterComponent } from './modules/footer/footer.component';
import { ModalComponent } from './modules/modal/modal.component';
import { DataViewComponent } from './modules/data-view/data-view.component';
import { SidebarComponent } from './modules/sidebar/sidebar.component';
import { InputsMediaComponent } from './modules/inputs/inputs-media/inputs-media.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { CommunicationCenterComponent } from './modules/communication-center/communication-center.component';
import { DetailsPanelComponent } from './modules/details-panel/details-panel.component';
import {
  LoginComponent
} from './modules/login/login.component';

import {
  authInterceptor
} from './global/service/auth.interceptor';

registerLocaleData(localeFr, 'fr-FR');

@NgModule({
  declarations: [AppComponent, InputsConditionsComponent, LoginComponent,
    InputsSelectionsComponent, InputsSimplesComponent, FormsComponent, 
    ListViewComponent, TooltipComponent, ToolbarComponent, ButtonComponent, 
    FooterComponent, ModalComponent, DataViewComponent, SidebarComponent, InputsMediaComponent, CommunicationCenterComponent, DetailsPanelComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PrimerModule,
  ],
  providers: [
provideHttpClient(
  withInterceptors([
    authInterceptor
  ])
),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
      ripple: true,
    }),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
