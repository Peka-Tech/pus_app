import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import {
  inject
} from '@angular/core';
import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import {
  AuthService
} from './auth.service';

const API_PREFIX=
  'http://localhost:5000/api';

const AUTH_PREFIX=
  `${API_PREFIX}/auth`;

const isRefreshRequest=(
  url: string
): boolean =>
  url===`${AUTH_PREFIX}/refresh`;

const isLoginRequest=(
  url: string
): boolean =>
  url===`${AUTH_PREFIX}/login`;

export const authInterceptor:
HttpInterceptorFn=(
  request,
  next
)=>{
  const authService=inject(AuthService);

  const isApiRequest=
    request.url.startsWith(API_PREFIX);

  const token=authService.accessToken;

  const authenticatedRequest=
    isApiRequest&&token
      ? request.clone({
          setHeaders:{
            Authorization:`Bearer ${token}`
          },
          withCredentials:true
        })
      : request.clone({
          withCredentials:
            isApiRequest||
            request.withCredentials
        });

  return next(authenticatedRequest).pipe(
    catchError(error=>{
      if(
        !(error instanceof HttpErrorResponse)||
        error.status!==401||
        !isApiRequest||
        isRefreshRequest(request.url)||
        isLoginRequest(request.url)
      ){
        return throwError(()=>error);
      }

      return authService.refresh().pipe(
        switchMap(result=>{
          const retry=request.clone({
            setHeaders:{
              Authorization:
                `Bearer ${result.accessToken}`
            },
            withCredentials:true
          });

          return next(retry);
        }),
        catchError(refreshError=>{
          authService.clearLocalSession();

          return throwError(
            ()=>refreshError
          );
        })
      );
    })
  );
};