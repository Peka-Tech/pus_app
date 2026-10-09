import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import {
  HttpErrorResponse
} from '@angular/common/http';
import {
  MessageService
} from 'primeng/api';
import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  datasGlobalI
} from './global/interface/data.interface';
import {
  dataTypeE,
  UIRequestStatusEnum
} from './global/interface/data.enums';
import {
  ServerRequestActionEnum
} from './global/interface/server.enum';
import {
  ServerRequestMetaInterface
} from './global/interface/server.interface';
import {
  UIRequestStateI,
  UISubmitRequestI
} from './global/interface/ui-runtime.interface';

import {
  app_manipulateData,
  AppDataAction
} from './app.functions';
import {
  AppService,
  AppTestDataI
} from './app.services';
import {
  AppSocket
} from './app.socket';
import {
  AppMemory
} from './app.memory';

import {
  ButtonEventI
} from './modules/button/button.component';
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

const EMPTY_DATA: datasGlobalI = {
  _id: '',
  name: '',
  description: '',
  dataType: dataTypeE.Mixed,
  dataKey: ''
};

const EMPTY_PROFILE: SidebarProfileI = {
  id: '',
  name: '',
  subtitle: '',
  imageUrl: '',
  status: 'offline'
};

@Component({
  selector: 'pus-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    MessageService
  ],
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class AppComponent
implements OnInit, OnDestroy {
  private readonly messageService =
    inject(MessageService);

  private readonly changeDetector =
    inject(ChangeDetectorRef);

  private readonly appService =
    inject(AppService);

  private readonly appSocket =
    inject(AppSocket);

  private readonly appMemory =
    inject(AppMemory);

  private readonly destroy$ =
    new Subject<void>();

  private socketBound = false;

  /* ==========================================================
   * CONFIGURATION CHARGÉE DEPUIS app.test.json
   * ========================================================== */

  actionButtons: datasGlobalI[] = [];

  toolbarData: datasGlobalI = {
    ...EMPTY_DATA,
    _id: 'toolbar-loading',
    name: 'Chargement',
    dataKey: 'toolbarLoading'
  };

  dataView: datasGlobalI = {
    ...EMPTY_DATA,
    _id: 'data-view-loading',
    name: 'Chargement',
    dataKey: 'dataViewLoading',
    resources: []
  };

  sidebarData: SidebarItemI[] = [];

  createUserModal: datasGlobalI = {
    ...EMPTY_DATA,
    _id: 'create-user-loading',
    name: 'Créer un utilisateur',
    dataKey: 'createUser'
  };

  currentProfile: SidebarProfileI = {
    ...EMPTY_PROFILE
  };

  information:
    CommunicationInformationI[] = [];

  /* ==========================================================
   * ÉTAT DE L’APPLICATION
   * ========================================================== */

  applicationLoading = true;
  activeSidebarId = 'users';

  selectedResources: DataResource[] = [];

  /* ==========================================================
   * MODAL
   * ========================================================== */

  createUserVisible = false;

  createUserRequestState:
    UIRequestStateI = {
      status: UIRequestStatusEnum.Idle
    };

  /* ==========================================================
   * COMMUNICATION
   * ========================================================== */

  communicationVisible = false;
  communicationSending = false;

  communicationSection:
    CommunicationSection = 'messages';

  messages:
    CommunicationMessageI[] = [];

  notifications:
    CommunicationNotificationI[] = [];

  /* ==========================================================
   * DETAILS
   * ========================================================== */

  detailsVisible = false;

  selectedDetails:
    Record<string, unknown> | null = null;

  /* ==========================================================
   * CYCLE DE VIE
   * ========================================================== */

  ngOnInit(): void {
    void this.app_initializeF();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.appSocket.disconnect();
  }

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
      notification =>
        notification.read !== true
    ).length;
  }

  /* ==========================================================
   * INITIALISATION
   * ========================================================== */

  private async app_initializeF():
    Promise<void> {
    try {
      const cached =
        await this.appMemory.get<AppTestDataI>(
          'app-initial-data',
          {
            storage: 'indexedDB'
          }
        );

      if (cached) {
        this.app_applyDataF(cached);
      }
    } catch {
      /*
       * L’échec du cache ne doit jamais empêcher
       * le chargement HTTP.
       */
    }

    this.app_loadDataHttpF();
  }

  private app_loadDataHttpF(): void {
    this.applicationLoading = true;

    this.appService
      .loadTestData()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: data => {
          this.app_applyDataF(data);

          void this.appMemory.set(
            'app-initial-data',
            data,
            {
              storage: 'indexedDB',
              expiresIn:
                24 * 60 * 60 * 1000
            }
          );
        },
        error: error => {
          this.applicationLoading = false;

          this.app_toastF(
            'error',
            'Configuration',
            this.app_httpErrorF(
              error,
              'Impossible de charger app.test.json.'
            )
          );

          this.changeDetector
            .markForCheck();
        }
      });
  }

  private app_applyDataF(
    data: AppTestDataI
  ): void {
    this.actionButtons =
      [...data.actionButtons];

    this.toolbarData = {
      ...data.toolbarData
    };

    this.dataView = {
      ...data.dataView,
      resources: [
        ...(data.dataView.resources ?? [])
      ]
    };

    this.sidebarData = [
      ...data.sidebarData
    ];

    this.createUserModal = {
      ...data.createUserModal
    };

    this.currentProfile = {
      ...data.currentProfile
    };

    this.messages = [
      ...data.messages
    ];

    this.notifications = [
      ...data.alerts,
      ...data.notifications
    ];

    this.information = [
      ...data.information
    ];

    this.activeSidebarId =
      data.initialState.activeSidebarId;

    this.createUserVisible =
      data.initialState.createUserVisible;

    this.communicationVisible =
      data.initialState.communicationVisible;

    this.communicationSending =
      data.initialState.communicationSending;

    this.communicationSection =
      data.initialState.communicationSection;

    this.detailsVisible =
      data.initialState.detailsVisible;

    this.selectedDetails =
      data.initialState.selectedDetails;

    this.applicationLoading = false;

    this.app_bindSocketF();

    this.changeDetector
      .markForCheck();
  }

  /* ==========================================================
   * SOCKET.IO
   *
   * Uniquement :
   * - messages
   * - alerts
   * - notifications
   * ========================================================== */

  private app_bindSocketF(): void {
    if (this.socketBound) {
      return;
    }

    this.socketBound = true;
    this.appSocket.connect();

    this.appSocket
      .listen<CommunicationMessageI>(
        'messages:created'
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        message =>
          this.socket_messageCreatedE(
            message
          )
      );

    this.appSocket
      .listen<CommunicationMessageI>(
        'messages:updated'
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        message =>
          this.socket_messageUpdatedE(
            message
          )
      );

    this.appSocket
      .listen<CommunicationMessageI>(
        'messages:deleted'
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        message =>
          this.socket_messageDeletedE(
            message
          )
      );

    this.appSocket
      .listen<CommunicationNotificationI>(
        'alerts:created'
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        alert =>
          this.socket_alertCreatedE(
            alert
          )
      );

    this.appSocket
      .listen<CommunicationNotificationI>(
        'notifications:created'
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        notification =>
          this.socket_notificationCreatedE(
            notification
          )
      );

    this.appSocket
      .listen<CommunicationNotificationI>(
        'notifications:updated'
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        notification =>
          this.socket_notificationUpdatedE(
            notification
          )
      );

    this.appSocket
      .listen<CommunicationNotificationI>(
        'notifications:deleted'
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        notification =>
          this.socket_notificationDeletedE(
            notification
          )
      );
  }

  private socket_messageCreatedE(
    message: CommunicationMessageI
  ): void {
    const result = app_manipulateData(
      ServerRequestActionEnum.Create,
      this.messages,
      message,
      {
        key: 'id'
      }
    );

    if (!result.success) {
      return;
    }

    this.messages = result.current;

    this.app_saveMessagesF();

    this.changeDetector
      .markForCheck();
  }

  private socket_messageUpdatedE(
    message: CommunicationMessageI
  ): void {
    const result = app_manipulateData(
      ServerRequestActionEnum.Update,
      this.messages,
      message,
      {
        key: 'id'
      }
    );

    if (!result.success) {
      return;
    }

    this.messages = result.current;

    this.app_saveMessagesF();

    this.changeDetector
      .markForCheck();
  }

  private socket_messageDeletedE(
    message: CommunicationMessageI
  ): void {
    const result = app_manipulateData(
      ServerRequestActionEnum.Delete,
      this.messages,
      message,
      {
        key: 'id'
      }
    );

    if (!result.success) {
      return;
    }

    this.messages = result.current;

    this.app_saveMessagesF();

    this.changeDetector
      .markForCheck();
  }

  private socket_alertCreatedE(
    alert: CommunicationNotificationI
  ): void {
    this.socket_notificationCreatedE(
      alert
    );

    this.app_toastF(
      this.app_notificationSeverityF(
        alert
      ),
      alert.title,
      alert.message
    );
  }

  private socket_notificationCreatedE(
    notification:
      CommunicationNotificationI
  ): void {
    const result = app_manipulateData(
      ServerRequestActionEnum.Create,
      this.notifications,
      notification,
      {
        key: 'id'
      }
    );

    if (!result.success) {
      return;
    }

    this.notifications = [
      ...result.current
    ].sort(
      (left, right) =>
        new Date(right.createdAt)
          .getTime() -
        new Date(left.createdAt)
          .getTime()
    );

    this.app_saveNotificationsF();

    this.changeDetector
      .markForCheck();
  }

  private socket_notificationUpdatedE(
    notification:
      CommunicationNotificationI
  ): void {
    const result = app_manipulateData(
      ServerRequestActionEnum.Update,
      this.notifications,
      notification,
      {
        key: 'id'
      }
    );

    if (!result.success) {
      return;
    }

    this.notifications = result.current;

    this.app_saveNotificationsF();

    this.changeDetector
      .markForCheck();
  }

  private socket_notificationDeletedE(
    notification:
      CommunicationNotificationI
  ): void {
    const result = app_manipulateData(
      ServerRequestActionEnum.Delete,
      this.notifications,
      notification,
      {
        key: 'id'
      }
    );

    if (!result.success) {
      return;
    }

    this.notifications = result.current;

    this.app_saveNotificationsF();

    this.changeDetector
      .markForCheck();
  }

  /* ==========================================================
   * MÉMOIRE DU NAVIGATEUR
   * ========================================================== */

  private app_saveMessagesF(): void {
    void this.appMemory.set(
      'messages',
      this.messages,
      {
        storage: 'indexedDB'
      }
    );
  }

  private app_saveNotificationsF(): void {
    void this.appMemory.set(
      'notifications',
      this.notifications,
      {
        storage: 'indexedDB'
      }
    );
  }

  private app_saveDataViewF(): void {
    void this.appMemory.set(
      `data-view:${this.dataView.dataKey}`,
      this.dataView.resources ?? [],
      {
        storage: 'indexedDB',
        expiresIn:
          30 * 60 * 1000
      }
    );
  }

  /* ==========================================================
   * HTTP : CHARGEMENT DES DONNÉES MÉTIER
   * ========================================================== */

  private dataView_loadHttpF(
    meta?: ServerRequestMetaInterface
  ): void {
    const resource =
      this.dataView.dataKey;

    if (!resource) {
      return;
    }

    this.dataView = {
      ...this.dataView,
      controls: {
        ...this.dataView.controls,
        loading: true
      }
    };

    this.appService
      .send<
        Record<string, unknown>,
        Record<string, unknown>
      >(
        resource,
        resource,
        ServerRequestActionEnum.FindAll,
        undefined,
        meta
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          this.dataView = {
            ...this.dataView,
            controls: {
              ...this.dataView.controls,
              loading: false
            },
            resources: [
              ...(response.datas ?? [])
            ],
            configurations: {
              ...this.dataView.configurations,
              pageIndex:
                response.meta?.page !== undefined
                  ? response.meta.page - 1
                  : this.dataView.configurations
                    ?.pageIndex,
              pageSize:
                response.meta?.limit ??
                this.dataView.configurations
                  ?.pageSize,
              totalRecords:
                response.meta?.total ??
                response.datas?.length ??
                0
            }
          };

          this.app_saveDataViewF();

          this.changeDetector
            .markForCheck();
        },
        error: error => {
          this.dataView = {
            ...this.dataView,
            controls: {
              ...this.dataView.controls,
              loading: false
            }
          };

          this.app_toastF(
            'error',
            'Chargement impossible',
            this.app_httpErrorF(
              error,
              'Impossible de récupérer les données.'
            )
          );

          this.changeDetector
            .markForCheck();
        }
      });
  }

  /* ==========================================================
   * APPLICATION
   * ========================================================== */

  app_mobileMenuClickE(): void {
    /*
     * L’ouverture visuelle est gérée
     * par SidebarComponent.
     */
  }

  private app_toastF(
    severity:
      | 'success'
      | 'info'
      | 'warn'
      | 'error',
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

  private app_httpErrorF(
    error: unknown,
    fallback: string
  ): string {
    if (
      error instanceof HttpErrorResponse
    ) {
      const serverMessage =
        typeof error.error === 'object' &&
        error.error !== null &&
        'message' in error.error
          ? String(error.error.message)
          : '';

      return (
        serverMessage ||
        error.message ||
        fallback
      );
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  }

  private app_notificationSeverityF(
    notification:
      CommunicationNotificationI
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'error' {
    switch (notification.severity) {
      case 'success':
        return 'success';

      case 'warning':
        return 'warn';

      case 'error':
        return 'error';

      default:
        return 'info';
    }
  }

  /* ==========================================================
   * SIDEBAR
   * ========================================================== */

  sidebar_itemClickE(
    event: SidebarNavigationEventI
  ): void {
    this.activeSidebarId =
      event.item.id;

    if (
      event.item.id === 'users' ||
      event.item.id === 'models' ||
      event.item.id === 'keys' ||
      event.item.id === 'devices'
    ) {
      this.dataView_loadHttpF({
        page: 1,
        limit:
          this.dataView.configurations
            ?.pageSize ?? 10
      });
    }
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
    void this.appMemory.set(
      'sidebar-collapsed',
      collapsed,
      {
        storage: 'local'
      }
    );
  }

  /* ==========================================================
   * TOOLBAR
   * ========================================================== */

  toolbar_backClickE(): void {
    this.app_toastF(
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
        if (
          this.selectedResources.length !== 1
        ) {
          this.app_toastF(
            'warn',
            'Modification',
            'Sélectionnez une seule ressource.'
          );
          return;
        }

        this.selectedDetails = {
          ...this.selectedResources[0]
        };

        this.detailsVisible = true;
        return;

      case 'delete':
        this.dataView_deleteSelectedHttpF();
        return;

      case 'export':
        this.dataView_exportHttpF();
        return;

      default:
        this.app_toastF(
          'info',
          'Action',
          event.button.name
        );
    }
  }

  toolbar_searchChangeE(
    event: ToolbarValueEventI
  ): void {
    void this.appMemory.set(
      'toolbar-search',
      String(event.value ?? ''),
      {
        storage: 'session'
      }
    );
  }

  toolbar_searchSubmitE(
    event: ToolbarValueEventI
  ): void {
    const search =
      String(event.value ?? '').trim();

    this.dataView_loadHttpF({
      page: 1,
      limit:
        this.dataView.configurations
          ?.pageSize ?? 10,
      filters: search
        ? {
            search
          }
        : {}
    });
  }

  toolbar_filterChangeE(
    event: ToolbarFilterEventI
  ): void {
    this.dataView_loadHttpF({
      page: 1,
      limit:
        this.dataView.configurations
          ?.pageSize ?? 10,
      filters: event.values
    });
  }

  toolbar_filtersChangeE(
    filters:
      Record<string, unknown>
  ): void {
    this.dataView_loadHttpF({
      page: 1,
      limit:
        this.dataView.configurations
          ?.pageSize ?? 10,
      filters
    });
  }

  toolbar_sortChangeE(
    event: ToolbarSortEventI
  ): void {
    this.dataView_loadHttpF({
      page:
        (
          this.dataView.configurations
            ?.pageIndex ?? 0
        ) + 1,
      limit:
        this.dataView.configurations
          ?.pageSize ?? 10,
      sort: {
        [event.data.dataKey]:
          String(event.direction)
            .toLowerCase() === 'asc'
            ? 1
            : -1
      }
    });
  }

  toolbar_viewChangeE(
    event: ToolbarViewEventI
  ): void {
    this.dataView = {
      ...this.dataView,
      configurations: {
        ...this.dataView.configurations,
        viewMode:
          event.value as never
      }
    };

    void this.appMemory.set(
      'data-view-mode',
      event.value,
      {
        storage: 'local'
      }
    );
  }

  toolbar_communicationClickE(
    event:
      ToolbarCommunicationEventI
  ): void {
    this.detailsVisible = false;

    this.communicationSection =
      event.action;

    this.communicationVisible = true;

    if (event.action === 'messages') {
      this.messages = this.messages.map(
        message => ({
          ...message,
          read: true
        })
      );

      this.app_saveMessagesF();
    }
  }

  /* ==========================================================
   * DATA VIEW
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
  }

  dataView_selectionChangeE(
    resources: DataResource[]
  ): void {
    this.selectedResources = [
      ...resources
    ];

    this.toolbarData = {
      ...this.toolbarData,
      configurations: {
        ...this.toolbarData.configurations,
        selectedCount:
          this.selectedResources.length
      }
    };
  }

  dataView_pageChangeE(
    event: DataViewEventI
  ): void {
    const pageEvent =
      event.event as {
        first?: number;
        rows?: number;
      };

    const limit =
      pageEvent.rows ??
      this.dataView.configurations
        ?.pageSize ??
      10;

    const page =
      Math.floor(
        (pageEvent.first ?? 0) /
        limit
      ) + 1;

    this.dataView_loadHttpF({
      page,
      limit
    });
  }

  dataView_sortChangeE(
    event: DataViewEventI
  ): void {
    const sortEvent =
      event.event as {
        field?: string;
        order?: number;
      };

    if (!sortEvent.field) {
      return;
    }

    this.dataView_loadHttpF({
      page: 1,
      limit:
        this.dataView.configurations
          ?.pageSize ?? 10,
      sort: {
        [sortEvent.field]:
          sortEvent.order === -1
            ? -1
            : 1
      }
    });
  }

  dataView_buttonClickE(
    event: DataViewButtonEventI
  ): void {
    switch (event.button.dataKey) {
      case 'view':
        this.selectedDetails = {
          ...event.resource
        };

        this.detailsVisible = true;
        return;

      case 'delete':
        this.selectedResources = [
          event.resource
        ];

        this.dataView_deleteSelectedHttpF();
        return;

      case 'duplicate':
        this.dataView_duplicateHttpF(
          event.resource
        );
        return;

      default:
        this.app_toastF(
          'info',
          event.button.name,
          String(
            event.resource['name'] ??
            'Action demandée'
          )
        );
    }
  }

  private dataView_deleteSelectedHttpF():
    void {
    if (
      this.selectedResources.length === 0
    ) {
      this.app_toastF(
        'warn',
        'Suppression',
        'Sélectionnez au moins une ressource.'
      );
      return;
    }

    const resource =
      this.dataView.dataKey;

    const action =
      this.selectedResources.length > 1
        ? ServerRequestActionEnum.DeleteMany
        : ServerRequestActionEnum.Delete;

    this.appService
      .send<
        DataResource,
        DataResource
      >(
        resource,
        resource,
        action,
        this.selectedResources
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          const deleted =
            response.datas?.length
              ? response.datas
              : this.selectedResources;

          const result =
            app_manipulateData(
              action,
              this.dataView.resources ?? [],
              deleted,
              {
                key: '_id'
              }
            );

          if (!result.success) {
            this.app_toastF(
              'error',
              'Suppression',
              result.error ??
              'Mise à jour locale impossible.'
            );
            return;
          }

          this.dataView = {
            ...this.dataView,
            resources: result.current,
            configurations: {
              ...this.dataView.configurations,
              totalRecords:
                Math.max(
                  0,
                  (
                    this.dataView
                      .configurations
                      ?.totalRecords ??
                    result.previous.length
                  ) -
                  result.difference
                    .removed.length
                )
            }
          };

          this.selectedResources = [];

          this.app_saveDataViewF();

          this.app_toastF(
            'success',
            'Suppression',
            response.message ??
            `${result.difference.removed.length} ressource(s) supprimée(s).`
          );

          this.changeDetector
            .markForCheck();
        },
        error: error => {
          this.app_toastF(
            'error',
            'Suppression impossible',
            this.app_httpErrorF(
              error,
              'Le serveur a refusé la suppression.'
            )
          );
        }
      });
  }

  private dataView_duplicateHttpF(
    source: DataResource
  ): void {
    const resource =
      this.dataView.dataKey;

    this.appService
      .send<
        DataResource,
        DataResource
      >(
        resource,
        resource,
        ServerRequestActionEnum.Duplicate,
        [source]
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          const created =
            response.datas?.[0];

          if (!created) {
            this.app_toastF(
              'error',
              'Duplication',
              'Le serveur n’a retourné aucune ressource.'
            );
            return;
          }

 


            const result =
  app_manipulateData<DataResource>(
    ServerRequestActionEnum.Create,
    this.dataView.resources ?? [],
    created,
    {
      key: '_id'
    }
  );


          if (!result.success) {
            this.app_toastF(
              'error',
              'Duplication',
              result.error ??
              'Mise à jour locale impossible.'
            );
            return;
          }

          this.dataView = {
            ...this.dataView,
            resources: result.current
          };

          this.app_saveDataViewF();

          this.app_toastF(
            'success',
            'Duplication',
            response.message ??
            'Ressource dupliquée.'
          );

          this.changeDetector
            .markForCheck();
        },
        error: error => {
          this.app_toastF(
            'error',
            'Duplication impossible',
            this.app_httpErrorF(
              error,
              'Le serveur a refusé la duplication.'
            )
          );
        }
      });
  }

  private dataView_exportHttpF(): void {
    const resource =
      this.dataView.dataKey;

    this.appService
      .download(
        resource,
        resource,
        ServerRequestActionEnum.Export,
        this.selectedResources.length
          ? this.selectedResources
          : undefined
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: blob => {
          const url =
            URL.createObjectURL(blob);

          const link =
            document.createElement('a');

          link.href = url;
          link.download =
            `${resource}-${Date.now()}.xlsx`;

          link.click();

          URL.revokeObjectURL(url);

          this.app_toastF(
            'success',
            'Export',
            'Le fichier a été téléchargé.'
          );
        },
        error: error => {
          this.app_toastF(
            'error',
            'Export impossible',
            this.app_httpErrorF(
              error,
              'Impossible de télécharger le fichier.'
            )
          );
        }
      });
  }

  /* ==========================================================
   * MODAL
   * ========================================================== */

  modal_visibleChangeE(
    visible: boolean
  ): void {
    this.createUserVisible = visible;

    if (
      !visible &&
      this.createUserRequestState
        .status !==
        UIRequestStatusEnum.Submitting
    ) {
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
      this.createUserRequestState = {
        status: UIRequestStatusEnum.Idle
      };
    }
  }

  modal_submitRequestE(
    event: UISubmitRequestI
  ): void {
    this.createUserRequestState = {
      status:
        UIRequestStatusEnum.Submitting,
      feedback: {
        severity: 'info',
        title: 'Création',
        message:
          'Création de l’utilisateur en cours...'
      }
    };

    this.appService
      .send<
        Record<string, unknown>,
        Record<string, unknown>
      >(
        'users',
        'users',
        ServerRequestActionEnum.Create,
        [event.value]
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          const created =
            response.datas?.[0];

          if (
            !response.success ||
            !created
          ) {
            this.createUserRequestState = {
              status:
                UIRequestStatusEnum.Error,
              feedback: {
                severity: 'error',
                title:
                  'Création impossible',
                message:
                  response.message ??
                  'Réponse serveur incomplète.'
              }
            };

            this.changeDetector
              .markForCheck();

            return;
          }

const result =
  app_manipulateData<DataResource>(
    ServerRequestActionEnum.Create,
    this.dataView.resources ?? [],
    created,
    {
      key: '_id'
    }
  );

          if (!result.success) {
            this.createUserRequestState = {
              status:
                UIRequestStatusEnum.Error,
              feedback: {
                severity: 'error',
                title:
                  'Création impossible',
                message:
                  result.error ??
                  'Mise à jour locale impossible.'
              }
            };

            this.changeDetector
              .markForCheck();

            return;
          }

          this.dataView = {
            ...this.dataView,
            resources: result.current,
            configurations: {
              ...this.dataView.configurations,
              totalRecords:
                result.current.length
            }
          };

          this.createUserRequestState = {
            status:
              UIRequestStatusEnum.Success,
            feedback: {
              severity: 'success',
              title: 'Utilisateur créé',
              message:
                response.message ??
                'Le nouvel utilisateur a été créé.'
            }
          };

          this.createUserVisible = false;

          this.app_saveDataViewF();

          this.app_toastF(
            'success',
            'Utilisateur créé',
            String(
              created['name'] ??
              'Nouvel utilisateur'
            )
          );

          this.changeDetector
            .markForCheck();
        },
        error: error => {
          const message =
            this.app_httpErrorF(
              error,
              'Le serveur a refusé la création.'
            );

          this.createUserRequestState = {
            status:
              UIRequestStatusEnum.Error,
            feedback: {
              severity: 'error',
              title:
                'Création impossible',
              message
            }
          };

          this.app_toastF(
            'error',
            'Création impossible',
            message
          );

          this.changeDetector
            .markForCheck();
        }
      });
  }

  /* ==========================================================
   * COMMUNICATION — SOCKET.IO UNIQUEMENT
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
    const content =
      event.content.trim();

    if (
      !content ||
      this.communicationSending
    ) {
      return;
    }

    this.communicationSending = true;

    const message:
      CommunicationMessageI = {
        id: `message-${crypto.randomUUID()}`,
        sender: {
          id: this.currentProfile.id,
          name: this.currentProfile.name,
          imageUrl:
            this.currentProfile.imageUrl
        },
        content,
        createdAt: new Date(),
        read: true,
        mine: true
      };

    const result =
      app_manipulateData(
        ServerRequestActionEnum.Create,
        this.messages,
        message,
        {
          key: 'id'
        }
      );

    if (!result.success) {
      this.communicationSending = false;

      this.app_toastF(
        'error',
        'Message',
        result.error ??
        'Impossible d’ajouter le message.'
      );

      return;
    }

    this.messages = result.current;

    this.appSocket.emit(
      'messages:created',
      message
    );

    this.communicationSending = false;

    this.app_saveMessagesF();

    this.app_toastF(
      'success',
      'Message envoyé',
      'Votre message a été ajouté à la conversation.'
    );

    this.changeDetector
      .markForCheck();
  }

  communication_notificationClickE(
    notification:
      CommunicationNotificationI
  ): void {
    const updated = {
      ...notification,
      read: true
    };

    const result =
      app_manipulateData(
        ServerRequestActionEnum.Update,
        this.notifications,
        updated,
        {
          key: 'id'
        }
      );

    if (result.success) {
      this.notifications =
        result.current;

      this.appSocket.emit(
        'notifications:read',
        updated
      );

      this.app_saveNotificationsF();
    }

    this.app_toastF(
      this.app_notificationSeverityF(
        notification
      ),
      notification.title,
      notification.message
    );
  }

  communication_markAllNotificationsReadE():
    void {
    const unread =
      this.notifications.filter(
        notification =>
          notification.read !== true
      );

    if (unread.length === 0) {
      this.app_toastF(
        'info',
        'Notifications',
        'Aucune nouvelle notification.'
      );
      return;
    }

    this.notifications =
      this.notifications.map(
        notification => ({
          ...notification,
          read: true
        })
      );

    this.appSocket.emit(
      'notifications:read',
      unread.map(
        notification =>
          notification.id
      )
    );

    this.app_saveNotificationsF();

    this.app_toastF(
      'success',
      'Notifications',
      `${unread.length} notification(s) marquée(s) comme lue(s).`
    );

    this.changeDetector
      .markForCheck();
  }

  /* ==========================================================
   * DETAILS
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

    this.app_toastF(
      'info',
      'Modification',
      `${String(
        data['name'] ?? 'Ressource'
      )} prête à être modifiée.`
    );
  }

  details_deleteClickE(
    data: Record<string, unknown>
  ): void {
    this.selectedResources = [
      data
    ];

    this.detailsVisible = false;

    this.dataView_deleteSelectedHttpF();
  }
}