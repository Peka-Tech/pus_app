import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PrimerModule } from '../../primer.module';
import { ButtonComponent } from '../button/button.component';
import {
  DataResource,
  DataViewComponent
} from './data-view.component';

import { datasGlobalI } from '../../global/interface/data.interface';
import {
  dataTypeE,
  UIComponentEnum,
  UIViewModeEnum
} from '../../global/interface/data.enums';

describe('DataViewComponent', () => {
  let component: DataViewComponent;
  let fixture: ComponentFixture<DataViewComponent>;

  const resources: DataResource[] = [
    {
      _id: 'user-1',
      name: 'Jean',
      profile: {
        city: 'Bukavu'
      },
      active: true
    },
    {
      _id: 'user-2',
      name: 'Marie',
      profile: {
        city: 'Goma'
      },
      active: false
    }
  ];

  const createColumn = (
    overrides: Partial<datasGlobalI> = {}
  ): datasGlobalI => ({
    _id: 'column-name',
    name: 'Nom',
    description: 'Nom',
    dataType: dataTypeE.String,
    dataKey: 'name',
    uiComponent: UIComponentEnum.Input,
    controls: {},
    configurations: {},
    ...overrides
  });

  const createButton = (
    overrides: Partial<datasGlobalI> = {}
  ): datasGlobalI => ({
    _id: 'button-view',
    name: 'Voir',
    description: 'Voir',
    dataType: dataTypeE.String,
    dataKey: 'view',
    uiComponent: UIComponentEnum.Button,
    controls: {},
    configurations: {},
    ...overrides
  });

  const createDataView = (
    overrides: Partial<datasGlobalI> = {}
  ): datasGlobalI => ({
    _id: 'data-view',
    name: 'Utilisateurs',
    description: 'Liste des utilisateurs',
    dataType: dataTypeE.Mixed,
    dataKey: 'users',
    uiComponent: UIComponentEnum.DataView,
    controls: {
      selectable: true,
      multiple: true,
      paginator: true,
      stripedRows: true,
      hoverable: true
    },
    configurations: {
      viewMode: UIViewModeEnum.Table,
      pageSize: 10,
      pageIndex: 0,
      totalRecords: 2,
      trackBy: '_id',
      rowsPerPageOptions: [10, 25, 50]
    },
    columns: [
      createColumn(),
      createColumn({
        _id: 'column-city',
        name: 'Ville',
        dataKey: 'profile.city'
      })
    ],
    buttons: [
      createButton()
    ],
    resources,
    ...overrides
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DataViewComponent,
        ButtonComponent
      ],
      imports: [
        PrimerModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      DataViewComponent
    );

    component = fixture.componentInstance;
  });

  const initialize = (
    data = createDataView()
  ): void => {
    fixture.componentRef.setInput(
      'data',
      data
    );

    fixture.detectChanges();
  };

  it('crée le composant', () => {
    initialize();

    expect(component).toBeTruthy();
    expect(component.resources.length).toBe(2);
    expect(component.columns.length).toBe(2);
  });

  it('résout une propriété imbriquée', () => {
    initialize();

    const cityColumn =
      component.columns.find(
        column =>
          column.dataKey === 'profile.city'
      )!;

    expect(
      component.getCellValue(
        resources[0],
        cityColumn
      )
    ).toBe('Bukavu');
  });

  it('formate les valeurs booléennes', () => {
    const activeColumn = createColumn({
      _id: 'active',
      name: 'Actif',
      dataKey: 'active',
      dataType: dataTypeE.Boolean
    });

    initialize(
      createDataView({
        columns: [activeColumn]
      })
    );

    expect(
      component.getCellValue(
        resources[0],
        activeColumn
      )
    ).toBe('Oui');

    expect(
      component.getCellValue(
        resources[1],
        activeColumn
      )
    ).toBe('Non');
  });

  it('sélectionne plusieurs ressources', () => {
    initialize();

    let emitted: DataResource[] = [];

    component.selectionChange.subscribe(
      value => {
        emitted = value;
      }
    );

    component.toggleSelection(resources[0]);
    component.toggleSelection(resources[1]);

    expect(component.selection.length).toBe(2);
    expect(emitted.length).toBe(2);
  });

  it('retire une ressource déjà sélectionnée', () => {
    initialize();

    component.toggleSelection(resources[0]);
    component.toggleSelection(resources[0]);

    expect(component.selection).toEqual([]);
  });

  it(
    'ne modifie pas manuellement la sélection lors du clic tableau',
    () => {
      initialize();

      component.onRowClick(
        resources[0],
        new MouseEvent('click')
      );

      expect(component.selection).toEqual([]);
    }
  );

  it(
    'modifie la sélection lors du clic liste ou grille',
    () => {
      initialize();

      component.onRowClick(
        resources[0],
        new MouseEvent('click'),
        true
      );

      expect(component.selection)
        .toEqual([resources[0]]);
    }
  );

  it('émet les changements de pagination', () => {
    initialize();

    const pageEvent = {
      first: 10,
      rows: 10,
      page: 1
    };

    let emitted: unknown;

    component.pageChange.subscribe(value => {
      emitted = value.event;
    });

    component.onPage(pageEvent);

    expect(emitted).toBe(pageEvent);
  });

  it('émet les changements de tri', () => {
    initialize();

    const sortEvent = {
      field: 'name',
      order: 1
    };

    let emitted: unknown;

    component.sortChange.subscribe(value => {
      emitted = value.event;
    });

    component.onSort(sortEvent);

    expect(emitted).toBe(sortEvent);
  });

  it('bloque les événements pendant le chargement', () => {
    initialize(
      createDataView({
        controls: {
          loading: true,
          selectable: true
        }
      })
    );

    let rowClickCount = 0;

    component.rowClick.subscribe(() => {
      rowClickCount++;
    });

    component.onRowClick(
      resources[0],
      new MouseEvent('click'),
      true
    );

    expect(component.locked).toBeTrue();
    expect(component.selection).toEqual([]);
    expect(rowClickCount).toBe(0);
  });

  it('désactive les actions lorsque la vue est verrouillée', () => {
    initialize(
      createDataView({
        controls: {
          disabled: true
        }
      })
    );

    expect(
      component.actionButtons[0]
        .controls?.disabled
    ).toBeTrue();
  });

  it('utilise une pagination sécurisée', () => {
    initialize(
      createDataView({
        configurations: {
          pageSize: -5,
          pageIndex: -2,
          rowsPerPageOptions: []
        }
      })
    );

    expect(component.pageSize).toBe(10);
    expect(component.pageIndex).toBe(0);

    expect(component.rowsPerPageOptions)
      .toEqual([10, 25, 50, 100]);
  });
});