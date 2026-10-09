import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import {
  TieredMenuModule
} from 'primeng/tieredmenu';

import {
  ButtonComponent,
  ButtonEventI
} from './button.component';
import {
  datasGlobalI
} from '../../global/interface/data.interface';
import {
  dataTypeE,
  UIComponentEnum,
  UISeverityEnum,
  UIVariantEnum
} from '../../global/interface/data.enums';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture:
    ComponentFixture<ButtonComponent>;

  const createButton = (
    overrides: Partial<datasGlobalI> = {}
  ): datasGlobalI => ({
    _id: 'button-1',
    name: 'Créer',
    description: 'Créer un élément',
    dataType: dataTypeE.String,
    dataKey: 'create',
    uiComponent: UIComponentEnum.Button,
    controls: {},
    configurations: {
      severity: UISeverityEnum.Primary,
      variant: UIVariantEnum.Filled
    },
    ...overrides
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ButtonComponent
      ],
      imports: [
        ButtonModule,
        TieredMenuModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      ButtonComponent
    );

    component = fixture.componentInstance;
  });

  it('crée le composant', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('émet un clic direct', () => {
    const button = createButton();
    let received:
      ButtonEventI | undefined;

    fixture.componentRef.setInput(
      'buttons',
      [button]
    );

    component.buttonClick.subscribe(event => {
      received = event;
    });

    fixture.detectChanges();

    component.onClick(
      button,
      new MouseEvent('click')
    );

    expect(received?.button).toBe(button);
  });

  it(
    'considère buttons vide comme une action',
    () => {
      const button = createButton({
        buttons: []
      });

      expect(
        component.isMenu(button)
      ).toBeFalse();
    }
  );

  it(
    'considère un bouton avec enfants comme un menu',
    () => {
      const menu = createButton({
        buttons: [
          createButton({
            _id: 'child'
          })
        ]
      });

      expect(
        component.isMenu(menu)
      ).toBeTrue();
    }
  );

  it(
    'n’émet rien pour un bouton désactivé',
    () => {
      const button = createButton({
        controls: {
          disabled: true
        }
      });

      let emissionCount = 0;

      fixture.componentRef.setInput(
        'buttons',
        [button]
      );

      component.buttonClick.subscribe(() => {
        emissionCount++;
      });

      fixture.detectChanges();

      component.onClick(
        button,
        new MouseEvent('click')
      );

      expect(emissionCount).toBe(0);
    }
  );

  it(
    'n’émet rien pour un bouton en chargement',
    () => {
      const button = createButton({
        controls: {
          loading: true
        }
      });

      let emissionCount = 0;

      fixture.componentRef.setInput(
        'buttons',
        [button]
      );

      component.buttonClick.subscribe(() => {
        emissionCount++;
      });

      fixture.detectChanges();

      component.onClick(
        button,
        new MouseEvent('click')
      );

      expect(emissionCount).toBe(0);
    }
  );

  it(
    'émet le clic d’un élément de menu',
    () => {
      const child = createButton({
        _id: 'btn-view',
        name: 'Voir',
        dataKey: 'view'
      });

      const menu = createButton({
        _id: 'btn-more',
        name: 'Plus',
        dataKey: 'more',
        buttons: [child]
      });

      let received:
        ButtonEventI | undefined;

      fixture.componentRef.setInput(
        'buttons',
        [menu]
      );

      component.buttonClick.subscribe(event => {
        received = event;
      });

      fixture.detectChanges();

      const [menuItem] =
        component.getMenuItems(menu);

      const clickEvent =
        new MouseEvent('click');

      component.onMenuItemClick(
        menuItem,
        clickEvent
      );

      expect(received?.button).toBe(child);
      expect(received?.event).toBe(clickEvent);
    }
  );

  it(
    'n’émet pas le clic d’un parent de menu',
    () => {
      const child = createButton({
        _id: 'child'
      });

      const menu = createButton({
        _id: 'menu',
        name: 'Plus',
        buttons: [child]
      });

      let emissionCount = 0;

      fixture.componentRef.setInput(
        'buttons',
        [menu]
      );

      component.buttonClick.subscribe(() => {
        emissionCount++;
      });

      fixture.detectChanges();

      const parentItem =
        component.groupedItems[0];

      component.onMenuItemClick(
        parentItem,
        new MouseEvent('click')
      );

      expect(emissionCount).toBe(0);
    }
  );

  it(
    'convertit Warning vers warn',
    () => {
      const button = createButton({
        configurations: {
          severity: UISeverityEnum.Warning
        }
      });

      expect(
        component.getSeverity(button)
      ).toBe('warn');
    }
  );

  it(
    'convertit Neutral vers secondary',
    () => {
      const button = createButton({
        configurations: {
          severity: UISeverityEnum.Neutral
        }
      });

      expect(
        component.getSeverity(button)
      ).toBe('secondary');
    }
  );

  it(
    'reconstruit le menu après une mise à jour immuable',
    () => {
      const child = createButton({
        _id: 'child',
        name: 'Voir',
        dataKey: 'view'
      });

      const menu = createButton({
        _id: 'menu',
        name: 'Plus',
        dataKey: 'more',
        buttons: [child]
      });

      fixture.componentRef.setInput(
        'buttons',
        [menu]
      );

      fixture.detectChanges();

      expect(
        component.getMenuItems(menu)[0].label
      ).toBe('Voir');

      const updatedChild: datasGlobalI = {
        ...child,
        name: 'Consulter'
      };

      const updatedMenu: datasGlobalI = {
        ...menu,
        buttons: [updatedChild]
      };

      fixture.componentRef.setInput(
        'buttons',
        [updatedMenu]
      );

      fixture.detectChanges();

      expect(
        component
          .getMenuItems(updatedMenu)[0]
          .label
      ).toBe('Consulter');
    }
  );
});