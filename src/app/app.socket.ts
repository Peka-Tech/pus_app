import {
  Injectable
} from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  io,
  Socket
} from 'socket.io-client';

export type AppSocketResource =
  | 'messages'
  | 'alerts'
  | 'notifications';

export type AppSocketAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'read'
  | 'received';

export type AppSocketEvent =
  `${AppSocketResource}:${AppSocketAction}`;

export interface AppSocketStatusI {
  connected: boolean;
  id?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppSocket {
  private readonly socketUrl =
    'http://localhost:5000';

  private socket: Socket | null = null;

  private readonly statusSubject =
    new BehaviorSubject<AppSocketStatusI>({
      connected: false
    });

  readonly status$ =
    this.statusSubject.asObservable();

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(
      this.socketUrl,
      {
        transports: [
          'websocket',
          'polling'
        ],
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      }
    );

    this.socket.on(
      'connect',
      () => {
        this.statusSubject.next({
          connected: true,
          id: this.socket?.id
        });
      }
    );

    this.socket.on(
      'disconnect',
      () => {
        this.statusSubject.next({
          connected: false
        });
      }
    );

    this.socket.on(
      'connect_error',
      (error: Error) => {
        this.statusSubject.next({
          connected: false,
          error: error.message
        });
      }
    );
  }

  disconnect(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;

    this.statusSubject.next({
      connected: false
    });
  }

  emit<T>(
    event: AppSocketEvent,
    data: T
  ): void {
    this.ensureConnection();
    this.socket?.emit(event, data);
  }

  listen<T>(
    event: AppSocketEvent
  ): Observable<T> {
    return new Observable<T>(
      subscriber => {
        this.ensureConnection();

        const listener = (
          data: T
        ): void => {
          subscriber.next(data);
        };

        this.socket?.on(
          event,
          listener
        );

        return () => {
          this.socket?.off(
            event,
            listener
          );
        };
      }
    );
  }

  private ensureConnection(): void {
    if (!this.socket) {
      this.connect();
    }
  }
}