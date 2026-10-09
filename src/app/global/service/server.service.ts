import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { ServerRequestActionEnum } from '../interface/server.enum';
import { ServerRequestInterface, ServerResponseInterface, ServerRequestMetaInterface } from '../interface/server.interface';

@Injectable({ providedIn: 'root' })
export class ServerService {
  private readonly http=inject(HttpClient);
  private readonly apiUrl='http://localhost:5000/api';

  request<TRequest=unknown,TResponse=TRequest>(request:ServerRequestInterface<TRequest>):Observable<ServerResponseInterface<TResponse>> {
    return this.http.post<ServerResponseInterface<TResponse>>(this.apiUrl,request);
  }

  send<TRequest=unknown,TResponse=TRequest>(module:string,resource:string,action:ServerRequestActionEnum,datas?:TRequest[],meta?:ServerRequestMetaInterface):Observable<ServerResponseInterface<TResponse>> {
    return this.request<TRequest,TResponse>({module,resource,action,...(datas!==undefined?{datas}:{}),...(meta!==undefined?{meta}:{})});
  }
}