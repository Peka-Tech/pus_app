import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  FormsModule
} from '@angular/forms';
import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations';

import {
  PrimerModule
} from '../../primer.module';
import {
  CommunicationCenterComponent
} from './communication-center.component';

describe('CommunicationCenterComponent', () => {
  let component:
    CommunicationCenterComponent;

  let fixture:
    ComponentFixture<CommunicationCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CommunicationCenterComponent
      ],
      imports: [
        FormsModule,
        PrimerModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      CommunicationCenterComponent
    );

    component = fixture.componentInstance;

    component.messages = [
      {
        id: 'm1',
        sender: {
          id: 'u1',
          name: 'Jean'
        },
        content: 'Bonjour',
        createdAt: new Date(),
        read: false
      },
      {
        id: 'm2',
        sender: {
          id: 'u2',
          name: 'Paul'
        },
        content: 'Salut',
        createdAt: new Date(),
        read: true
      }
    ];

    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });

  it('calcule les messages non lus', () => {
    expect(component.unreadMessages).toBe(1);
  });

  it('n’envoie pas un message vide', () => {
    spyOn(component.messageSend, 'emit');

    component.draft = '   ';
    component.sendMessage();

    expect(
      component.messageSend.emit
    ).not.toHaveBeenCalled();
  });

  it('envoie un message nettoyé', () => {
    spyOn(component.messageSend, 'emit');

    component.draft = '  Bonjour  ';
    component.sendMessage();

    expect(
      component.messageSend.emit
    ).toHaveBeenCalledWith({
      content: 'Bonjour'
    });

    expect(component.draft).toBe('');
  });

  it('émet la fermeture', () => {
    spyOn(component.visibleChange, 'emit');

    component.close();

    expect(
      component.visibleChange.emit
    ).toHaveBeenCalledWith(false);
  });
});