import {
  HttpClient,
  HttpEvent,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import {
  Injectable,
  inject
} from '@angular/core';
import {
  Observable,
  map
} from 'rxjs';

import {
  datasGlobalI
} from './global/interface/data.interface';
import {
  ServerRequestActionEnum
} from './global/interface/server.enum';
import {
  ServerRequestInterface,
  ServerRequestMetaInterface,
  ServerResponseInterface
} from './global/interface/server.interface';
import {
  CommunicationInformationI,
  CommunicationMessageI,
  CommunicationNotificationI
} from './modules/communication-center/communication-center.component';
import {
  SidebarItemI,
  SidebarProfileI
} from './modules/sidebar/sidebar.component';

export type AppTransport =
  | 'http'
  | 'socket';

export interface AppAlertI
extends CommunicationNotificationI {}

export interface AppInitialStateI {
  activeSidebarId: string;
  createUserVisible: boolean;
  createUserRequestState: {
    status: string;
  };
  communicationVisible: boolean;
  communicationSending: boolean;
  communicationSection:
    | 'messages'
    | 'notifications'
    | 'information';
  detailsVisible: boolean;
  selectedDetails:
    Record<string, unknown> | null;
}

export interface AppTransportConfigurationI {
  default: AppTransport;
  socketResources: string[];
  httpResources: string[];
  upload: 'http';
  download: 'http';
}

interface AppDataDefinitionI
extends datasGlobalI {
  buttonSource?: string;
}

export interface AppTestDataI {
  version: number;
  environment: string;
  transport: AppTransportConfigurationI;
  actionButtons: datasGlobalI[];
  toolbarData: AppDataDefinitionI;
  dataView: AppDataDefinitionI;
  sidebarData: SidebarItemI[];
  createUserModal: datasGlobalI;
  currentProfile: SidebarProfileI;
  messages: CommunicationMessageI[];
  alerts: AppAlertI[];
  notifications: CommunicationNotificationI[];
  information: CommunicationInformationI[];
  initialState: AppInitialStateI;
}

export interface AppUploadOptionsI {
  fieldName?: string;
  reportProgress?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api';

  private readonly testDataUrl =
    '/assets/app.test.json';

  request<
    TRequest = unknown,
    TResponse = TRequest
  >(
    request: ServerRequestInterface<TRequest>
  ): Observable<
    ServerResponseInterface<TResponse>
  > {
    return this.http.post<
      ServerResponseInterface<TResponse>
    >(
      this.apiUrl,
      request,
      {
        withCredentials: true
      }
    );
  }

  send<
    TRequest = unknown,
    TResponse = TRequest
  >(
    module: string,
    resource: string,
    action: ServerRequestActionEnum,
    datas?: TRequest[],
    meta?: ServerRequestMetaInterface
  ): Observable<
    ServerResponseInterface<TResponse>
  > {
    const request: ServerRequestInterface<TRequest> = {
      module,
      resource,
      action,
      ...(datas !== undefined
        ? { datas }
        : {}),
      ...(meta !== undefined
        ? { meta }
        : {})
    };

    return this.request<
      TRequest,
      TResponse
    >(request);
  }

  upload<
    TRequest = unknown,
    TResponse = TRequest
  >(
    request: ServerRequestInterface<TRequest>,
    files: readonly File[],
    options: AppUploadOptionsI = {}
  ): Observable<
    HttpEvent<ServerResponseInterface<TResponse>>
  > {
    const formData = new FormData();
    const fieldName =
      options.fieldName ?? 'files';

    formData.append(
      'request',
      JSON.stringify(request)
    );

    for (const file of files) {
      formData.append(
        fieldName,
        file,
        file.name
      );
    }

    return this.http.post<
      ServerResponseInterface<TResponse>
    >(
      this.apiUrl,
      formData,
      {
        observe: 'events',
        reportProgress:
          options.reportProgress ?? true,
        withCredentials: true
      }
    );
  }

  download(
    module: string,
    resource: string,
    action: ServerRequestActionEnum,
    datas?: unknown[],
    meta?: ServerRequestMetaInterface
  ): Observable<Blob> {
    const request: ServerRequestInterface = {
      module,
      resource,
      action,
      ...(datas !== undefined
        ? { datas }
        : {}),
      ...(meta !== undefined
        ? { meta }
        : {})
    };

    return this.http.post(
      this.apiUrl,
      request,
      {
        responseType: 'blob',
        withCredentials: true
      }
    );
  }

  loadTestData(): Observable<AppTestDataI> {
    return this.http
      .get<AppTestDataI>(
        this.testDataUrl,
        {
          headers: new HttpHeaders({
            Accept: 'application/json'
          })
        }
      )
      .pipe(
        map(data => this.hydrateTestData(data))
      );
  }

  private hydrateTestData(
    data: AppTestDataI
  ): AppTestDataI {
    const actions = data.actionButtons;

    return {
      ...data,
      toolbarData: {
        ...data.toolbarData,
        buttons:
          data.toolbarData.buttonSource ===
          'actionButtons'
            ? actions
            : data.toolbarData.buttons
      },
      dataView: {
        ...data.dataView,
        buttons:
          data.dataView.buttonSource ===
          'actionButtons'
            ? actions
            : data.dataView.buttons
      },
      messages: data.messages.map(
        message => ({
          ...message,
          createdAt: new Date(
            message.createdAt
          )
        })
      ),
      alerts: data.alerts.map(
        alert => ({
          ...alert,
          createdAt: new Date(
            alert.createdAt
          )
        })
      ),
      notifications:
        data.notifications.map(
          notification => ({
            ...notification,
            createdAt: new Date(
              notification.createdAt
            )
          })
        ),
      information:
        data.information.map(
          information => ({
            ...information,
            ...(information.createdAt
              ? {
                  createdAt: new Date(
                    information.createdAt
                  )
                }
              : {})
          })
        )
    };
  }
}