import {
    Injectable,
    inject
} from '@angular/core';
import {
    HttpClient
} from '@angular/common/http';
import {
    BehaviorSubject,
    Observable,
    catchError,
    map,
    of,
    switchMap,
    tap
} from 'rxjs';

import {
    ServerResponseInterface
} from '../interface/server.interface';
import {
    AuthContextI,
    AuthLoginI,
    AuthMeI,
    AuthTokenI,
    AuthUserI
} from '../interface/auth.interface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http =
        inject(HttpClient);

    private readonly authUrl =
        'http://localhost:5000/api/auth';

    private accessTokenValue:
        string | null = null;

    private readonly authenticatedSubject =
        new BehaviorSubject<boolean>(false);

    private readonly readySubject =
        new BehaviorSubject<boolean>(false);

    private readonly authSubject =
        new BehaviorSubject<AuthContextI | null>(
            null
        );

    private readonly userSubject =
        new BehaviorSubject<AuthUserI | null>(
            null
        );

    readonly authenticated$ =
        this.authenticatedSubject.asObservable();

    readonly ready$ =
        this.readySubject.asObservable();

    readonly auth$ =
        this.authSubject.asObservable();

    readonly user$ =
        this.userSubject.asObservable();

    get accessToken(): string | null {
        return this.accessTokenValue;
    }

    get authenticated(): boolean {
        return this.authenticatedSubject.value;
    }

    login(
        credentials: AuthLoginI
    ): Observable<AuthMeI> {
        return this.http.post<
            ServerResponseInterface<AuthTokenI>
        >(
            `${this.authUrl}/login`,
            credentials,
            {
                withCredentials: true
            }
        ).pipe(
            map(response =>
                this.firstData(
                    response,
                    'Réponse de connexion invalide'
                )
            ),
            tap(token =>
                this.applyToken(token)
            ),
            switchMap(() => this.me()),
            tap(() =>
                this.readySubject.next(true)
            )
        );
    }

    refresh(): Observable<AuthTokenI> {
        return this.http.post<
            ServerResponseInterface<AuthTokenI>
        >(
            `${this.authUrl}/refresh`,
            {},
            {
                withCredentials: true
            }
        ).pipe(
            map(response =>
                this.firstData(
                    response,
                    'Réponse de renouvellement invalide'
                )
            ),
            tap(token =>
                this.applyToken(token)
            )
        );
    }

    me(): Observable<AuthMeI> {
        return this.http.get<
            ServerResponseInterface<AuthMeI>
        >(
            `${this.authUrl}/me`,
            {
                withCredentials: true
            }
        ).pipe(
            map(response =>
                this.firstData(
                    response,
                    'Identité introuvable'
                )
            ),
            tap(result => {
                this.authSubject.next(result.auth);
                this.userSubject.next(result.user);
                this.authenticatedSubject.next(true);
            })
        );
    }

    bootstrap(): Observable<boolean> {
        return this.refresh().pipe(
            switchMap(() => this.me()),
            map(() => true),
            catchError(() => {
                this.clearLocalSession();
                return of(false);
            }),
            tap(() =>
                this.readySubject.next(true)
            )
        );
    }

    logout(): Observable<void> {
        return this.http.post<
            ServerResponseInterface<unknown>
        >(
            `${this.authUrl}/logout`,
            {},
            {
                withCredentials: true
            }
        ).pipe(
            map(() => undefined),
            tap(() =>
                this.clearLocalSession()
            ),
            catchError(() => {
                this.clearLocalSession();
                return of(undefined);
            })
        );
    }

    clearLocalSession(): void {
        this.accessTokenValue = null;
        this.authSubject.next(null);
        this.userSubject.next(null);
        this.authenticatedSubject.next(false);
    }

    private applyToken(
        token: AuthTokenI
    ): void {
        this.accessTokenValue =
            token.accessToken;

        this.authSubject.next(token.auth);
        this.authenticatedSubject.next(true);
    }

    private firstData<T>(
        response: ServerResponseInterface<T>,
        message: string
    ): T {
        const value = response.datas?.[0];

        if (!response.success || value === undefined) {
            throw new Error(
                response.message ?? message
            );
        }

        return value;
    }
}