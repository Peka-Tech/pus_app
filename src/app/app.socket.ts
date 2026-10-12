import {
  Injectable,
  inject
} from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  io,
  Socket
} from 'socket.io-client';
import {
  AuthService
} from './global/service/auth.service';

export type AppSocketResource=
  | 'messages'
  | 'alerts'
  | 'notifications'
  | 'realtime'
  | 'conversations';

export type AppSocketAction=
  | 'created'
  | 'updated'
  | 'deleted'
  | 'read'
  | 'received'
  | 'ready'
  | 'join'
  | 'leave';

export type AppSocketEvent=
  `${AppSocketResource}:${AppSocketAction}`;

export interface AppSocketStatusI {
  connected:boolean;
  id?:string;
  error?:string;
}

export interface AppSocketAcknowledgementI {
  success:boolean;
  message:string;
}

@Injectable({
  providedIn:'root'
})
export class AppSocket {
  private readonly authService=
    inject(AuthService);

  private readonly socketUrl=
    'http://localhost:5000';

  private socket:Socket|null=null;

  private readonly statusSubject=
    new BehaviorSubject<AppSocketStatusI>({
      connected:false
    });

  readonly status$=
    this.statusSubject.asObservable();

  connect():void{
    const token=this.authService.accessToken;

    if(!token){
      this.statusSubject.next({
        connected:false,
        error:'Access token indisponible'
      });
      return;
    }

    if(this.socket?.connected){
      return;
    }

    if(this.socket){
      this.socket.auth={token};
      this.socket.connect();
      return;
    }

    this.socket=io(this.socketUrl,{
      auth:{token},
      transports:[
        'websocket',
        'polling'
      ],
      withCredentials:true,
      autoConnect:true,
      reconnection:true,
      reconnectionAttempts:10,
      reconnectionDelay:1000
    });

    this.socket.on('connect',()=>{
      this.statusSubject.next({
        connected:true,
        id:this.socket?.id
      });
    });

    this.socket.on('disconnect',()=>{
      this.statusSubject.next({
        connected:false
      });
    });

    this.socket.on(
      'connect_error',
      (error:Error)=>{
        this.statusSubject.next({
          connected:false,
          error:error.message
        });
      }
    );

    this.socket.io.on(
      'reconnect_attempt',
      ()=>{
        const refreshedToken=
          this.authService.accessToken;

        if(
          this.socket&&
          refreshedToken
        ){
          this.socket.auth={
            token:refreshedToken
          };
        }
      }
    );
  }

  disconnect():void{
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket=null;

    this.statusSubject.next({
      connected:false
    });
  }

  joinConversation(
    conversationId:string
  ):Promise<AppSocketAcknowledgementI>{
    return this.emitWithAcknowledgement(
      'conversations:join',
      conversationId
    );
  }

  leaveConversation(
    conversationId:string
  ):Promise<AppSocketAcknowledgementI>{
    return this.emitWithAcknowledgement(
      'conversations:leave',
      conversationId
    );
  }

  emit<T>(
    event:AppSocketEvent,
    data:T
  ):void{
    this.ensureConnection();
    this.socket?.emit(event,data);
  }

  listen<T>(
    event:AppSocketEvent
  ):Observable<T>{
    return new Observable<T>(subscriber=>{
      this.ensureConnection();

      const listener=(data:T):void=>{
        subscriber.next(data);
      };

      this.socket?.on(event,listener);

      return ()=>{
        this.socket?.off(event,listener);
      };
    });
  }

  private emitWithAcknowledgement(
    event:'conversations:join'|
      'conversations:leave',
    conversationId:string
  ):Promise<AppSocketAcknowledgementI>{
    this.ensureConnection();

    return new Promise(resolve=>{
      if(!this.socket){
        resolve({
          success:false,
          message:'Socket indisponible'
        });
        return;
      }

      this.socket.timeout(5000).emit(
        event,
        conversationId,
        (
          error:Error|null,
          response:
            AppSocketAcknowledgementI
        )=>{
          if(error){
            resolve({
              success:false,
              message:
                'Délai Socket.IO dépassé'
            });
            return;
          }

          resolve(response);
        }
      );
    });
  }

  private ensureConnection():void{
    if(!this.socket){
      this.connect();
    }
  }
}