import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations';

import {
  PrimerModule
} from '../../primer.module';
import {
  DetailsPanelComponent
} from './details-panel.component';

describe('DetailsPanelComponent', () => {
  let component: DetailsPanelComponent;
  let fixture:
    ComponentFixture<DetailsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DetailsPanelComponent
      ],
      imports: [
        PrimerModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      DetailsPanelComponent
    );

    component = fixture.componentInstance;

    component.data = {
      _id: 'u1',
      name: 'Jean Kabungulu',
      active: true,
      address: {
        city: 'Bukavu'
      }
    };

    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });

  it('exclut les identifiants automatiques', () => {
    expect(
      component.fields.some(
        field => field.key === '_id'
      )
    ).toBeFalse();
  });

  it('formate les booléens', () => {
    expect(
      component.displayValue(true)
    ).toBe('Oui');

    expect(
      component.displayValue(false)
    ).toBe('Non');
  });

  it('émet la modification', () => {
    spyOn(component.editClick, 'emit');

    component.edit();

    expect(
      component.editClick.emit
    ).toHaveBeenCalledWith(
      component.data!
    );
  });

  it('émet la fermeture', () => {
    spyOn(component.visibleChange, 'emit');

    component.close();

    expect(
      component.visibleChange.emit
    ).toHaveBeenCalledWith(false);
  });
});