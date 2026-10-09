import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PrimerModule } from '../../primer.module';
import { ToolbarComponent } from './toolbar.component';
import { ButtonComponent } from '../button/button.component';

import { datasGlobalI } from '../../global/interface/data.interface';
import {
  dataTypeE,
  UIActionEnum,
  UIComponentEnum,
  UISortDirectionEnum,
  UIViewModeEnum
} from '../../global/interface/data.enums';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  const createInput = (
    overrides: Partial<datasGlobalI> = {}
  ): datasGlobalI => ({
    _id: 'input-1',
    name: 'Champ',
    description: 'Champ de test',
    dataType: dataTypeE.String,
    dataKey: 'field',
    uiComponent: UIComponentEnum.Input,
    controls: {},
    configurations: {},
    ...overrides
  });

  const createButton = (
    overrides: Partial<datasGlobalI> = {}
  ): datasGlobalI => ({
    _id: 'button-1',
    name: 'Créer',
    description: 'Créer',
    dataType: dataTypeE.String,
    dataKey: 'create',
    uiComponent: UIComponentEnum.Button,
    controls: {},
    configurations: {},
    ...overrides
  });

  const createToolbar = (
    overrides: Partial<datasGlobalI> = {}
  ): datasGlobalI => ({
    _id: 'toolbar-1',
    name: 'Utilisateurs',
    description: 'Gestion des utilisateurs',
    dataType: dataTypeE.Mixed,
    dataKey: 'usersToolbar',
    uiComponent: UIComponentEnum.Toolbar,
    controls: {
      showBack: true
    },
    configurations: {
      count: 10,
      selectedCount: 0
    },
    inputs: [
      createInput({
        _id: 'search',
        name: 'Recherche',
        dataKey: 'search',
        value: '',
        controls: {
          showClear: true
        },
        configurations: {
          action: UIActionEnum.Search,
          debounce: 300
        }
      }),
      createInput({
        _id: 'filter',
        name: 'Statut',
        dataKey: 'status',
        value: null,
        configurations: {
          action: UIActionEnum.Filter
        },
        resources: [
          {
            name: 'Actif',
            value: 'active'
          }
        ]
      }),
      createInput({
        _id: 'sort',
        name: 'Nom',
        dataKey: 'name',
        controls: {
          selected: true
        },
        configurations: {
          action: UIActionEnum.Sort,
          sortDirection:
            UISortDirectionEnum.Asc
        }
      }),
      createInput({
        _id: 'view-table',
        name: 'Table',
        dataKey: 'table',
        controls: {
          selected: true
        },
        configurations: {
          action: UIActionEnum.View,
          viewMode: UIViewModeEnum.Table
        }
      }),
      createInput({
        _id: 'view-grid',
        name: 'Grille',
        dataKey: 'grid',
        configurations: {
          action: UIActionEnum.View,
          viewMode: UIViewModeEnum.Grid
        }
      })
    ],
    buttons: [
      createButton(),
      createButton({
        _id: 'selection-button',
        dataKey: 'delete',
        controls: {
          selectionOnly: true
        }
      })
    ],
    ...overrides
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ToolbarComponent,
        ButtonComponent
      ],
      imports: [
        PrimerModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      ToolbarComponent
    );

    component = fixture.componentInstance;
  });

  const initialize = (
    data = createToolbar()
  ): void => {
    fixture.componentRef.setInput(
      'data',
      data
    );

    fixture.detectChanges();
  };

  it('crée la toolbar', () => {
    initialize();

    expect(component).toBeTruthy();
    expect(component.title).toBe('Utilisateurs');
  });

  it('initialise recherche, filtres, tri et vues', () => {
    initialize();

    expect(component.searchInput?.dataKey)
      .toBe('search');

    expect(component.filters.length).toBe(1);
    expect(component.sorts.length).toBe(1);
    expect(component.views.length).toBe(2);

    expect(component.selectedSort?.dataKey)
      .toBe('name');

    expect(component.selectedView?.dataKey)
      .toBe('table');
  });

  it('émet la recherche après le debounce', fakeAsync(() => {
    initialize();

    let emittedValue: unknown;

    component.searchChange.subscribe(event => {
      emittedValue = event.value;
    });

    const input =
      document.createElement('input');

    input.value = 'Jean';

    component.onSearchInput(
      new Event('input')
    );

    /*
     * Event.target est en lecture seule.
     * On appelle donc le gestionnaire avec
     * une structure compatible.
     */
    component.onSearchInput({
      target: input
    } as unknown as Event);

    tick(299);

    expect(emittedValue).toBeUndefined();

    tick(1);

    expect(emittedValue).toBe('Jean');
  }));

  it('émet immédiatement la recherche validée', () => {
    initialize();

    component.searchValue = '  Jean  ';

    let submittedValue: unknown;

    component.searchSubmit.subscribe(event => {
      submittedValue = event.value;
    });

    component.onSearchSubmit();

    expect(submittedValue).toBe('Jean');
  });

  it('met à jour et émet un filtre', () => {
    initialize();

    const filter = component.filters[0];
    let emittedValues:
      Record<string, unknown> | undefined;

    component.filtersChange.subscribe(values => {
      emittedValues = values;
    });

    component.onFilterChange(
      filter,
      'active'
    );

    expect(component.filterValues['status'])
      .toBe('active');

    expect(emittedValues?.['status'])
      .toBe('active');
  });

  it('inverse la direction du tri', () => {
    initialize();

    let direction:
      UISortDirectionEnum | undefined;

    component.sortChange.subscribe(event => {
      direction = event.direction;
    });

    component.toggleSortDirection();

    expect(direction)
      .toBe(UISortDirectionEnum.Desc);
  });

  it('change la vue et émet son mode', () => {
    initialize();

    const grid = component.views.find(
      view => view.dataKey === 'grid'
    )!;

    let value: unknown;

    component.viewChange.subscribe(event => {
      value = event.value;
    });

    component.setView(grid);

    expect(component.selectedView).toBe(grid);
    expect(value).toBe(UIViewModeEnum.Grid);
  });

  it(
    'masque les actions selectionOnly sans sélection',
    () => {
      initialize();

      expect(component.actionButtons.length)
        .toBe(1);

      expect(component.actionButtons[0].dataKey)
        .toBe('create');
    }
  );


  it('émet l’ouverture des messages', () => {
  spyOn(
    component.communicationClick,
    'emit'
  );

  component.openMessages();

  expect(
    component.communicationClick.emit
  ).toHaveBeenCalledWith({
    action: 'messages'
  });
});

it('émet l’ouverture des notifications', () => {
  spyOn(
    component.communicationClick,
    'emit'
  );

  component.openNotifications();

  expect(
    component.communicationClick.emit
  ).toHaveBeenCalledWith({
    action: 'notifications'
  });
});


  it(
    'affiche les actions selectionOnly avec une sélection',
    () => {
      const data = createToolbar({
        configurations: {
          count: 10,
          selectedCount: 2
        }
      });

      initialize(data);

      expect(component.actionButtons.length)
        .toBe(2);
    }
  );

  it('bloque les interactions pendant le chargement', () => {
    const data = createToolbar({
      controls: {
        loading: true,
        showBack: true
      }
    });

    initialize(data);

    let backCount = 0;

    component.backClick.subscribe(() => {
      backCount++;
    });

    component.onBack(
      new MouseEvent('click')
    );

    expect(component.locked).toBeTrue();
    expect(backCount).toBe(0);

    expect(
      component.actionButtons.every(
        button =>
          button.controls?.disabled === true
      )
    ).toBeTrue();
  });
});