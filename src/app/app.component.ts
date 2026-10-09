import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';
import { MessageService } from 'primeng/api';

import { datasGlobalI } from './global/interface/data.interface';
import {
  dataTypeE,
  UIComponentEnum,
  UIPresentationModeEnum,
  UIRequestStatusEnum,
  UISeverityEnum,
  UIVariantEnum,
  UIViewModeEnum
} from './global/interface/data.enums';
import {
  InputGroupEnum,
  InputTypeEnum
} from './global/interface/input-form.enum';
import {
  UIRequestStateI,
  UISubmitRequestI
} from './global/interface/ui-runtime.interface';

import { ButtonEventI } from './modules/button/button.component';
import {
  CommunicationInformationI,
  CommunicationMessageI,
  CommunicationNotificationI,
  CommunicationSection,
  CommunicationSendEventI
} from './modules/communication-center/communication-center.component';
import {
  DataResource,
  DataViewButtonEventI,
  DataViewEventI,
  DataViewRowEventI
} from './modules/data-view/data-view.component';
import {
  ModalCloseEventI
} from './modules/modal/modal.component';
import {
  SidebarItemI,
  SidebarNavigationEventI,
  SidebarProfileI
} from './modules/sidebar/sidebar.component';
import {
  ToolbarCommunicationEventI,
  ToolbarFilterEventI,
  ToolbarSortEventI,
  ToolbarValueEventI,
  ToolbarViewEventI
} from './modules/toolbar/toolbar.component';

/* ============================================================
 * DONNÉES STATIQUES
 * Les configurations restent hors de AppComponent.
 * AppComponent ne conserve que l’état dynamique et les événements.
 * ============================================================ */

const ACTION_BUTTONS: datasGlobalI[] = [
  {
    _id: 'button-create',
    name: 'Créer',
    description: 'Créer un utilisateur',
    dataType: dataTypeE.String,
    dataKey: 'create',
    uiComponent: UIComponentEnum.Button,
    configurations: {
      icon: 'pi pi-plus',
      severity: UISeverityEnum.Success,
      variant: UIVariantEnum.Filled
    }
  },
  {
    _id: 'button-edit',
    name: 'Modifier',
    description: 'Modifier la sélection',
    dataType: dataTypeE.String,
    dataKey: 'edit',
    uiComponent: UIComponentEnum.Button,
    configurations: {
      icon: 'pi pi-pencil',
      severity: UISeverityEnum.Primary,
      variant: UIVariantEnum.Outlined
    }
  },
  {
    _id: 'button-delete',
    name: 'Supprimer',
    description: 'Supprimer la sélection',
    dataType: dataTypeE.String,
    dataKey: 'delete',
    uiComponent: UIComponentEnum.Button,
    configurations: {
      icon: 'pi pi-trash',
      severity: UISeverityEnum.Danger,
      variant: UIVariantEnum.Filled
    }
  },
  {
    _id: 'button-more',
    name: 'Plus',
    description: 'Afficher les autres actions',
    dataType: dataTypeE.String,
    dataKey: 'more',
    uiComponent: UIComponentEnum.Button,
    configurations: {
      icon: 'pi pi-ellipsis-v',
      severity: UISeverityEnum.Secondary,
      variant: UIVariantEnum.Outlined
    },
    buttons: [
      {
        _id: 'button-view',
        name: 'Voir',
        description: 'Afficher les détails',
        dataType: dataTypeE.String,
        dataKey: 'view',
        uiComponent: UIComponentEnum.Button,
        configurations: {
          icon: 'pi pi-eye'
        }
      },
      {
        _id: 'button-duplicate',
        name: 'Dupliquer',
        description: 'Dupliquer la ressource',
        dataType: dataTypeE.String,
        dataKey: 'duplicate',
        uiComponent: UIComponentEnum.Button,
        configurations: {
          icon: 'pi pi-copy'
        }
      },
      {
        _id: 'button-export',
        name: 'Exporter',
        description: 'Exporter les données',
        dataType: dataTypeE.String,
        dataKey: 'export',
        uiComponent: UIComponentEnum.Button,
        configurations: {
          icon: 'pi pi-download'
        }
      }
    ]
  }
];

const TOOLBAR_DATA: datasGlobalI = {
  _id: 'toolbar-users',
  name: 'Utilisateurs',
  label: 'Utilisateurs',
  description: 'Gestion des utilisateurs du système',
  dataType: dataTypeE.Mixed,
  dataKey: 'usersToolbar',
  uiComponent: UIComponentEnum.Toolbar,
  controls: {
    disabled: false,
    loading: false,
    showBack: true
  },
  configurations: {
    icon: 'pi pi-users',
    count: 5,
    selectedCount: 0
  },
  buttons: ACTION_BUTTONS
};

const DATA_VIEW: datasGlobalI = {
  _id: 'data-view-users',
  name: 'Utilisateurs',
  label: 'Utilisateurs',
  description: 'Liste des utilisateurs du système',
  dataType: dataTypeE.Array,
  dataKey: 'users',
  uiComponent: UIComponentEnum.DataView,
  controls: {
    disabled: false,
    loading: false,
    selectable: true,
    multiple: false,
    paginator: true,
    lazy: false,
    stripedRows: true,
    showGridlines: false,
    resizable: true,
    reorderable: false
  },
  configurations: {
    viewMode: UIViewModeEnum.Grid,
    trackBy: '_id',
    pageSize: 10,
    pageIndex: 0,
    totalRecords: 5,
    rowsPerPageOptions: [10, 25, 50, 100]
  },
  columns: [
    {
      _id: 'column-name',
      name: 'Nom',
      label: 'Nom',
      description: 'Nom complet',
      dataType: dataTypeE.String,
      dataKey: 'name',
      controls: {
        hidden: false,
        sortable: true
      },
      configurations: {
        icon: 'pi pi-user'
      }
    },
    {
      _id: 'column-email',
      name: 'Email',
      label: 'Email',
      description: 'Adresse email',
      dataType: dataTypeE.String,
      dataKey: 'email',
      controls: {
        hidden: false,
        sortable: true
      },
      configurations: {
        icon: 'pi pi-envelope'
      }
    },
    {
      _id: 'column-status',
      name: 'Statut',
      label: 'Statut',
      description: 'Statut utilisateur',
      dataType: dataTypeE.String,
      dataKey: 'status',
      controls: {
        hidden: false,
        sortable: true
      }
    },
    {
      _id: 'column-city',
      name: 'Ville',
      label: 'Ville',
      description: 'Ville de résidence',
      dataType: dataTypeE.String,
      dataKey: 'address.city',
      controls: {
        hidden: false,
        sortable: false
      },
      configurations: {
        icon: 'pi pi-map-marker'
      }
    }
  ],
  resources: [
    {
      _id: 'user-001',
      name: 'Jean Kabungulu',
      email: 'jean@peka.com',
      status: 'Actif',
      address: {
        city: 'Bukavu',
        country: 'RDC'
      }
    },
    {
      _id: 'user-002',
      name: 'Paul Mbuyi',
      email: 'paul@peka.com',
      status: 'Inactif',
      address: {
        city: 'Goma',
        country: 'RDC'
      }
    },
    {
      _id: 'user-003',
      name: 'Grace Mwamba',
      email: 'grace@peka.com',
      status: 'Actif',
      address: {
        city: 'Butembo',
        country: 'RDC'
      }
    },
    {
      _id: 'user-004',
      name: 'Daniel Kasongo',
      email: 'daniel@peka.com',
      status: 'Bloqué',
      address: {
        city: 'Kinshasa',
        country: 'RDC'
      }
    },
    {
      _id: 'user-005',
      name: 'Sarah Bahati',
      email: 'sarah@peka.com',
      status: 'Actif',
      address: {
        city: 'Bukavu',
        country: 'RDC'
      }
    }
  ],
  buttons: ACTION_BUTTONS
};

const SIDEBAR_DATA: readonly SidebarItemI[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    description: 'Vue générale du système',
    icon: 'pi pi-home',
    accent: 'blue'
  },
  {
    id: 'management',
    label: 'Gestion',
    description: 'Gestion des ressources',
    icon: 'pi pi-objects-column',
    accent: 'cyan',
    children: [
      {
        id: 'users',
        label: 'Utilisateurs',
        description: 'Gestion des utilisateurs',
        icon: 'pi pi-users',
        badge: 245,
        accent: 'cyan'
      },
      {
        id: 'organizations',
        label: 'Organisations',
        description: 'Gestion des organisations',
        icon: 'pi pi-building',
        badge: 12,
        accent: 'violet'
      },
      {
        id: 'roles',
        label: 'Rôles et permissions',
        description: 'Gestion des autorisations',
        icon: 'pi pi-shield',
        accent: 'green'
      }
    ]
  },
  {
    id: 'database',
    label: 'Données',
    description: 'Modèles et ressources',
    icon: 'pi pi-database',
    accent: 'violet',
    children: [
      {
        id: 'models',
        label: 'Modèles',
        icon: 'pi pi-box',
        badge: 8,
        accent: 'violet'
      },
      {
        id: 'keys',
        label: 'Clés',
        icon: 'pi pi-key',
        badge: 42,
        accent: 'amber'
      }
    ]
  },
  {
    id: 'devices',
    label: 'Appareils',
    description: 'Équipements connectés',
    icon: 'pi pi-microchip',
    badge: 18,
    accent: 'green'
  },
  {
    id: 'reports',
    label: 'Rapports',
    description: 'Rapports et exports',
    icon: 'pi pi-chart-bar',
    accent: 'amber'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    description: 'Configuration du système',
    icon: 'pi pi-cog',
    accent: 'blue'
  }
];

const CREATE_USER_MODAL: datasGlobalI = {
  _id: 'create-user-modal',
  name: 'Créer un utilisateur',
  label: 'Nouvel utilisateur',
  description: 'Renseignez les informations du nouvel utilisateur.',
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
    presentationMode: UIPresentationModeEnum.Modal,
    modalTitle: 'Créer un utilisateur',
    modalWidth: '38rem'
  },
  inputs: [
    {
      _id: 'create-user-name',
      name: 'Nom',
      label: 'Nom complet',
      description: 'Nom complet de l’utilisateur',
      dataType: dataTypeE.String,
      dataKey: 'name',
      uiComponent: UIComponentEnum.Input,
      inputGroup: InputGroupEnum.Simple,
      inputType: InputTypeEnum.Text,
      controls: {
        required: [true, 'Le nom est obligatoire'],
        trim: true,
        autoFocus: true
      },
      limits: {
        minLength: [2, 'Minimum 2 caractères'],
        maxLength: [120, 'Maximum 120 caractères']
      },
      configurations: {
        icon: 'pi pi-user',
        placeholder: 'Nom complet'
      }
    },
    {
      _id: 'create-user-email',
      name: 'Email',
      label: 'Adresse email',
      description: 'Adresse email de connexion',
      dataType: dataTypeE.String,
      dataKey: 'email',
      uiComponent: UIComponentEnum.Input,
      inputGroup: InputGroupEnum.Simple,
      inputType: InputTypeEnum.Text,
      controls: {
        required: [true, 'L’adresse email est obligatoire'],
        trim: true,
        lowercase: true
      },
      limits: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      },
      configurations: {
        icon: 'pi pi-envelope',
        placeholder: 'utilisateur@peka.com',
        autoComplete: 'email'
      }
    },
    {
      _id: 'create-user-password',
      name: 'Mot de passe',
      label: 'Mot de passe',
      description: 'Mot de passe initial de l’utilisateur',
      dataType: dataTypeE.String,
      dataKey: 'password',
      uiComponent: UIComponentEnum.Input,
      inputGroup: InputGroupEnum.Simple,
      inputType: InputTypeEnum.Password,
      controls: {
        required: [true, 'Le mot de passe est obligatoire'],
        feedback: true,
        toggleMask: true
      },
      limits: {
        minLength: [8, 'Minimum 8 caractères'],
        maxLength: [120, 'Maximum 120 caractères']
      },
      configurations: {
        icon: 'pi pi-lock',
        placeholder: 'Mot de passe',
        autoComplete: 'new-password'
      }
    }
  ]
};

const CURRENT_PROFILE: SidebarProfileI = {
  id: 'current-user',
  name: 'Jean Peka',
  subtitle: 'Administrateur',
  imageUrl: '',
  status: 'online'
};

const INITIAL_MESSAGES: CommunicationMessageI[] = [
  {
    id: 'message-1',
    sender: {
      id: 'user-2',
      name: 'Paul Mbuyi'
    },
    content: 'Bonjour, le rapport est disponible.',
    createdAt: new Date(),
    read: false
  },
  {
    id: 'message-2',
    sender: {
      id: CURRENT_PROFILE.id,
      name: CURRENT_PROFILE.name
    },
    content: 'Merci, je vais le vérifier.',
    createdAt: new Date(),
    read: true,
    mine: true
  }
];

const INITIAL_NOTIFICATIONS: CommunicationNotificationI[] = [
  {
    id: 'notification-1',
    title: 'Nouvel utilisateur',
    message: 'Un nouvel utilisateur a été créé.',
    createdAt: new Date(),
    icon: 'pi pi-user-plus',
    severity: 'success',
    read: false
  },
  {
    id: 'notification-2',
    title: 'Connexion',
    message: 'Une nouvelle connexion a été détectée.',
    createdAt: new Date(),
    icon: 'pi pi-shield',
    severity: 'warning',
    read: false
  }
];

const INFORMATION: CommunicationInformationI[] = [
  {
    id: 'information-1',
    title: 'Peka Universal System',
    message: 'Tous les services sont opérationnels.',
    createdAt: new Date(),
    icon: 'pi pi-check-circle'
  }
];

/* ============================================================
 * COMPOSANT RACINE
 * ============================================================ */

@Component({
  selector: 'pus-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly messageService = inject(MessageService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  /* Configuration statique */

  readonly actionButtons = ACTION_BUTTONS;
  readonly toolbarData = TOOLBAR_DATA;
  readonly dataView = DATA_VIEW;
  readonly sidebarData = SIDEBAR_DATA;
  readonly createUserModal = CREATE_USER_MODAL;
  readonly currentProfile = CURRENT_PROFILE;
  readonly information = INFORMATION;

  activeSidebarId = 'users';
  createUserVisible = false;

  createUserRequestState: UIRequestStateI = {
    status: UIRequestStatusEnum.Idle
  };

  /* État du centre de communication */

  communicationVisible = false;
  communicationSending = false;

  communicationSection: CommunicationSection = 'messages';

  messages: CommunicationMessageI[] = [
    ...INITIAL_MESSAGES
  ];

  notifications: CommunicationNotificationI[] = [
    ...INITIAL_NOTIFICATIONS
  ];

  /* État du panneau de détails */

  detailsVisible = false;

  selectedDetails: Record<string, unknown> | null = null;

  /* ==========================================================
   * VALEURS CALCULÉES
   * ========================================================== */

  get unreadMessages(): number {
    return this.messages.filter(
      message => message.read !== true
    ).length;
  }

  get unreadNotifications(): number {
    return this.notifications.filter(
      notification => notification.read !== true
    ).length;
  }

  /* ==========================================================
   * ÉVÉNEMENTS APPLICATION
   * ========================================================== */

  app_mobileMenuClickE(): void {
    this.app_toast(
      'info',
      'Navigation',
      'Menu mobile ouvert'
    );
  }

  private app_toast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string
  ): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3500
    });
  }

  /* ==========================================================
   * ÉVÉNEMENTS SIDEBAR
   * ========================================================== */

  sidebar_itemClickE(
    event: SidebarNavigationEventI
  ): void {
    this.activeSidebarId = event.item.id;

    this.app_toast(
      'info',
      'Navigation',
      event.item.label
    );
  }

  sidebar_profileClickE(
    profile: SidebarProfileI
  ): void {
    this.communicationVisible = false;

    this.selectedDetails = {
      id: profile.id,
      name: profile.name,
      role: profile.subtitle,
      status: profile.status
    };

    this.detailsVisible = true;
  }

  sidebar_collapsedChangeE(
    collapsed: boolean
  ): void {
    this.app_toast(
      'info',
      'Menu',
      collapsed
        ? 'Menu réduit'
        : 'Menu développé'
    );
  }

  /* ==========================================================
   * ÉVÉNEMENTS TOOLBAR
   * ========================================================== */

  toolbar_backClickE(): void {
    this.app_toast(
      'info',
      'Navigation',
      'Retour demandé'
    );
  }

  toolbar_buttonClickE(
    event: ButtonEventI
  ): void {
    switch (event.button.dataKey) {
      case 'create':
        this.createUserVisible = true;
        this.createUserRequestState = {
          status: UIRequestStatusEnum.Idle
        };
        return;

      case 'edit':
        this.app_toast(
          'info',
          'Modification',
          'Sélectionnez une ressource à modifier'
        );
        return;

      case 'delete':
        this.app_toast(
          'warn',
          'Suppression',
          'Sélectionnez une ressource à supprimer'
        );
        return;

      case 'view':
        this.app_toast(
          'info',
          'Détails',
          'Affichage des détails demandé'
        );
        return;

      case 'duplicate':
        this.app_toast(
          'success',
          'Duplication',
          'Duplication demandée'
        );
        return;

      case 'export':
        this.app_toast(
          'success',
          'Export',
          'Export des données demandé'
        );
        return;

      default:
        this.app_toast(
          'info',
          'Action',
          event.button.name
        );
    }
  }

  toolbar_searchChangeE(
    event: ToolbarValueEventI
  ): void {
    if (typeof event.value !== 'string') {
      return;
    }

    const search = event.value.trim();

    if (!search) {
      return;
    }
  }

  toolbar_searchSubmitE(
    event: ToolbarValueEventI
  ): void {
    const search = String(event.value ?? '').trim();

    this.app_toast(
      'info',
      'Recherche',
      search
        ? `Recherche : ${search}`
        : 'Recherche réinitialisée'
    );
  }

  toolbar_filterChangeE(
    event: ToolbarFilterEventI
  ): void {
    this.app_toast(
      'info',
      'Filtre',
      `${Object.keys(event.values).length} filtre(s) actif(s)`
    );
  }

  toolbar_filtersChangeE(
    filters: Record<string, unknown>
  ): void {
    this.app_toast(
      'info',
      'Filtres',
      `${Object.keys(filters).length} filtre(s) appliqué(s)`
    );
  }

  toolbar_sortChangeE(
    event: ToolbarSortEventI
  ): void {
    this.app_toast(
      'info',
      'Tri',
      `Direction : ${event.direction}`
    );
  }

  toolbar_viewChangeE(
    event: ToolbarViewEventI
  ): void {
    this.app_toast(
      'info',
      'Affichage',
      `Vue : ${String(event.value)}`
    );
  }

  toolbar_communicationClickE(
    event: ToolbarCommunicationEventI
  ): void {
    this.detailsVisible = false;

    this.communicationSection = event.action;
    this.communicationVisible = true;

    if (event.action === 'messages') {
      this.messages = this.messages.map(message => ({
        ...message,
        read: true
      }));
    }
  }

  /* ==========================================================
   * ÉVÉNEMENTS DATA VIEW
   * ========================================================== */

  dataView_rowClickE(
    event: DataViewRowEventI
  ): void {
    this.selectedDetails = {
      ...event.resource
    };

    this.detailsVisible = true;
  }

  dataView_rowDoubleClickE(
    event: DataViewRowEventI
  ): void {
    this.selectedDetails = {
      ...event.resource
    };

    this.detailsVisible = true;

    this.app_toast(
      'info',
      'Utilisateur',
      String(event.resource['name'] ?? 'Détails ouverts')
    );
  }

  dataView_selectionChangeE(
    resources: DataResource[]
  ): void {
    if (resources.length === 0) {
      return;
    }

    this.app_toast(
      'info',
      'Sélection',
      `${resources.length} ressource(s) sélectionnée(s)`
    );
  }

  dataView_pageChangeE(
    event: DataViewEventI
  ): void {
    this.app_toast(
      'info',
      'Pagination',
      'Page mise à jour'
    );
  }

  dataView_sortChangeE(
    event: DataViewEventI
  ): void {
    this.app_toast(
      'info',
      'Tri des données',
      'Tri appliqué'
    );
  }

  dataView_buttonClickE(
    event: DataViewButtonEventI
  ): void {
    if (event.button.dataKey === 'view') {
      this.selectedDetails = {
        ...event.resource
      };

      this.detailsVisible = true;
      return;
    }

    this.app_toast(
      'info',
      event.button.name,
      String(
        event.resource['name'] ??
        'Action exécutée'
      )
    );
  }

  /* ==========================================================
   * ÉVÉNEMENTS MODAL
   * ========================================================== */

  modal_visibleChangeE(
    visible: boolean
  ): void {
    this.createUserVisible = visible;

    if (!visible &&
      this.createUserRequestState.status !==
      UIRequestStatusEnum.Submitting) {
      this.createUserRequestState = {
        status: UIRequestStatusEnum.Idle
      };
    }
  }

  modal_closeRequestE(
    event: ModalCloseEventI
  ): void {
    this.createUserVisible = false;

    if (event.source !== 'success') {
      this.app_toast(
        'info',
        'Formulaire',
        'Création annulée'
      );
    }
  }

  modal_submitRequestE(
    event: UISubmitRequestI
  ): void {
    this.createUserRequestState = {
      status: UIRequestStatusEnum.Submitting,
      feedback: {
        severity: 'info',
        title: 'Création',
        message: 'Création de l’utilisateur en cours...'
      }
    };

    /*
     * Remplacez ce délai par votre appel ServerService.
     * Exemple :
     *
     * this.serverService.send(
     *   'users',
     *   'users',
     *   ServerRequestActionEnum.Create,
     *   [event.value]
     * ).subscribe(...)
     */

    setTimeout(() => {
      const createdUser = {
        _id: `user-${Date.now()}`,
        ...event.value,
        status: 'Actif'
      };

      this.createUserRequestState = {
        status: UIRequestStatusEnum.Success,
        feedback: {
          severity: 'success',
          title: 'Utilisateur créé',
          message: 'Le nouvel utilisateur a été créé.'
        }
      };

      this.dataView.resources = [
        ...(this.dataView.resources ?? []),
        createdUser
      ];

      if (this.dataView.configurations) {
        this.dataView.configurations.totalRecords =
          this.dataView.resources.length;
      }

      this.createUserVisible = false;

      this.notifications = [
        {
          id: `notification-${Date.now()}`,
          title: 'Nouvel utilisateur',
          message: `${String(
            event.value['name'] ?? 'Utilisateur'
          )} a été créé.`,
          createdAt: new Date(),
          icon: 'pi pi-user-plus',
          severity: 'success',
          read: false
        },
        ...this.notifications
      ];

      this.app_toast(
        'success',
        'Utilisateur créé',
        String(
          event.value['name'] ??
          'Le nouvel utilisateur'
        )
      );

      this.changeDetector.markForCheck();
    }, 700);
  }

  /* ==========================================================
   * ÉVÉNEMENTS COMMUNICATION
   * ========================================================== */

  communication_visibleChangeE(
    visible: boolean
  ): void {
    this.communicationVisible = visible;
  }

  communication_activeSectionChangeE(
    section: CommunicationSection
  ): void {
    this.communicationSection = section;
  }

  communication_messageSendE(
    event: CommunicationSendEventI
  ): void {
    const content = event.content.trim();

    if (!content || this.communicationSending) {
      return;
    }

    this.communicationSending = true;

    const message: CommunicationMessageI = {
      id: `message-${Date.now()}`,
      sender: {
        id: this.currentProfile.id,
        name: this.currentProfile.name,
        imageUrl: this.currentProfile.imageUrl
      },
      content,
      createdAt: new Date(),
      read: true,
      mine: true
    };

    this.messages = [
      ...this.messages,
      message
    ];

    this.communicationSending = false;

    this.app_toast(
      'success',
      'Message envoyé',
      'Votre message apparaît maintenant dans la conversation.'
    );

    this.changeDetector.markForCheck();
  }

  communication_notificationClickE(
    notification: CommunicationNotificationI
  ): void {
    this.notifications = this.notifications.map(item =>
      item.id === notification.id
        ? {
          ...item,
          read: true
        }
        : item
    );

    this.app_toast(
      notification.severity === 'error'
        ? 'error'
        : notification.severity === 'warning'
          ? 'warn'
          : notification.severity ?? 'info',
      notification.title,
      notification.message
    );
  }

  communication_markAllNotificationsReadE(): void {
    const unreadCount = this.unreadNotifications;

    this.notifications = this.notifications.map(item => ({
      ...item,
      read: true
    }));

    this.app_toast(
      'success',
      'Notifications',
      unreadCount > 0
        ? `${unreadCount} notification(s) marquée(s) comme lue(s)`
        : 'Aucune nouvelle notification'
    );
  }

  /* ==========================================================
   * ÉVÉNEMENTS DETAILS PANEL
   * ========================================================== */

  details_visibleChangeE(
    visible: boolean
  ): void {
    this.detailsVisible = visible;

    if (!visible) {
      this.selectedDetails = null;
    }
  }

  details_editClickE(
    data: Record<string, unknown>
  ): void {
    this.detailsVisible = false;

    this.app_toast(
      'info',
      'Modification',
      `${String(data['name'] ?? 'Ressource')} prête à être modifiée`
    );
  }

  details_deleteClickE(
    data: Record<string, unknown>
  ): void {
    this.app_toast(
      'warn',
      'Suppression',
      `Suppression demandée pour ${String(
        data['name'] ?? 'la ressource'
      )}`
    );
  }
}