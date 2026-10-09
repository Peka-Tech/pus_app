import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  provideHttpClient
} from '@angular/common/http';
import {
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { AppComponent } from './app.component';
import { ServerService } from './global/service/server.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        ServerService,
        provideHttpClient(),
        provideHttpClientTesting()
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(AppComponent);

    component = fixture.componentInstance;
  });

  it('crée l’application', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});