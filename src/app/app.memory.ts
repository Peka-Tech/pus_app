import {
  Injectable
} from '@angular/core';

export type AppMemoryStorage =
  | 'memory'
  | 'session'
  | 'local'
  | 'indexedDB';

export interface AppMemoryOptionsI {
  storage?: AppMemoryStorage;
  expiresIn?: number;
}

interface AppMemoryEnvelope<T> {
  value: T;
  createdAt: number;
  expiresAt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppMemory {
  private readonly prefix = 'pus:';
  private readonly databaseName =
    'pus-browser-memory';
  private readonly storeName =
    'entries';
  private readonly version = 1;

  private readonly memory =
    new Map<
      string,
      AppMemoryEnvelope<unknown>
    >();

  async set<T>(
    key: string,
    value: T,
    options: AppMemoryOptionsI = {}
  ): Promise<void> {
    const envelope =
      this.createEnvelope(
        value,
        options.expiresIn
      );

    switch (
      options.storage ?? 'memory'
    ) {
      case 'memory':
        this.memory.set(key, envelope);
        return;

      case 'session':
        sessionStorage.setItem(
          this.storageKey(key),
          JSON.stringify(envelope)
        );
        return;

      case 'local':
        localStorage.setItem(
          this.storageKey(key),
          JSON.stringify(envelope)
        );
        return;

      case 'indexedDB':
        await this.indexedSet(
          key,
          envelope
        );
        return;
    }
  }

  async get<T>(
    key: string,
    options: AppMemoryOptionsI = {}
  ): Promise<T | undefined> {
    let envelope:
      AppMemoryEnvelope<T> | undefined;

    switch (
      options.storage ?? 'memory'
    ) {
      case 'memory':
        envelope =
          this.memory.get(key) as
          AppMemoryEnvelope<T> | undefined;
        break;

      case 'session':
        envelope = this.readWebStorage<T>(
          sessionStorage,
          key
        );
        break;

      case 'local':
        envelope = this.readWebStorage<T>(
          localStorage,
          key
        );
        break;

      case 'indexedDB':
        envelope =
          await this.indexedGet<T>(key);
        break;
    }

    if (!envelope) {
      return undefined;
    }

    if (this.expired(envelope)) {
      await this.remove(key, options);
      return undefined;
    }

    return envelope.value;
  }

  async remove(
    key: string,
    options: AppMemoryOptionsI = {}
  ): Promise<void> {
    switch (
      options.storage ?? 'memory'
    ) {
      case 'memory':
        this.memory.delete(key);
        return;

      case 'session':
        sessionStorage.removeItem(
          this.storageKey(key)
        );
        return;

      case 'local':
        localStorage.removeItem(
          this.storageKey(key)
        );
        return;

      case 'indexedDB':
        await this.indexedRemove(key);
        return;
    }
  }

  async clear(
    storage: AppMemoryStorage
  ): Promise<void> {
    switch (storage) {
      case 'memory':
        this.memory.clear();
        return;

      case 'session':
        this.clearWebStorage(
          sessionStorage
        );
        return;

      case 'local':
        this.clearWebStorage(
          localStorage
        );
        return;

      case 'indexedDB':
        await this.indexedClear();
        return;
    }
  }

  async has(
    key: string,
    options: AppMemoryOptionsI = {}
  ): Promise<boolean> {
    return (
      await this.get(
        key,
        options
      )
    ) !== undefined;
  }

  async cachePut(
    cacheName: string,
    request: RequestInfo | URL,
    response: Response
  ): Promise<void> {
    const cache =
      await caches.open(
        `${this.prefix}${cacheName}`
      );

    await cache.put(
      request,
      response.clone()
    );
  }

  async cacheGet(
    cacheName: string,
    request: RequestInfo | URL
  ): Promise<Response | undefined> {
    const cache =
      await caches.open(
        `${this.prefix}${cacheName}`
      );

    return (
      await cache.match(request)
    ) ?? undefined;
  }

  async cacheRemove(
    cacheName: string,
    request: RequestInfo | URL
  ): Promise<boolean> {
    const cache =
      await caches.open(
        `${this.prefix}${cacheName}`
      );

    return cache.delete(request);
  }

  async cacheClear(
    cacheName: string
  ): Promise<boolean> {
    return caches.delete(
      `${this.prefix}${cacheName}`
    );
  }

  private createEnvelope<T>(
    value: T,
    expiresIn?: number
  ): AppMemoryEnvelope<T> {
    const createdAt = Date.now();

    return {
      value,
      createdAt,
      ...(expiresIn !== undefined
        ? {
            expiresAt:
              createdAt + expiresIn
          }
        : {})
    };
  }

  private expired(
    envelope:
      AppMemoryEnvelope<unknown>
  ): boolean {
    return (
      envelope.expiresAt !== undefined &&
      envelope.expiresAt <= Date.now()
    );
  }

  private storageKey(
    key: string
  ): string {
    return `${this.prefix}${key}`;
  }

  private readWebStorage<T>(
    storage: Storage,
    key: string
  ): AppMemoryEnvelope<T> | undefined {
    const raw = storage.getItem(
      this.storageKey(key)
    );

    if (!raw) {
      return undefined;
    }

    try {
      return JSON.parse(
        raw
      ) as AppMemoryEnvelope<T>;
    } catch {
      storage.removeItem(
        this.storageKey(key)
      );

      return undefined;
    }
  }

  private clearWebStorage(
    storage: Storage
  ): void {
    const keys: string[] = [];

    for (
      let index = 0;
      index < storage.length;
      index++
    ) {
      const key = storage.key(index);

      if (
        key?.startsWith(this.prefix)
      ) {
        keys.push(key);
      }
    }

    for (const key of keys) {
      storage.removeItem(key);
    }
  }

  private openDatabase():
    Promise<IDBDatabase> {
    return new Promise(
      (resolve, reject) => {
        const request =
          indexedDB.open(
            this.databaseName,
            this.version
          );

        request.onupgradeneeded =
          () => {
            const database =
              request.result;

            if (
              !database.objectStoreNames
                .contains(this.storeName)
            ) {
              database.createObjectStore(
                this.storeName
              );
            }
          };

        request.onsuccess =
          () => resolve(request.result);

        request.onerror =
          () => reject(request.error);
      }
    );
  }

  private async indexedSet<T>(
    key: string,
    value: AppMemoryEnvelope<T>
  ): Promise<void> {
    const database =
      await this.openDatabase();

    await new Promise<void>(
      (resolve, reject) => {
        const transaction =
          database.transaction(
            this.storeName,
            'readwrite'
          );

        transaction
          .objectStore(this.storeName)
          .put(value, key);

        transaction.oncomplete =
          () => resolve();

        transaction.onerror =
          () => reject(
            transaction.error
          );
      }
    );

    database.close();
  }

  private async indexedGet<T>(
    key: string
  ): Promise<
    AppMemoryEnvelope<T> | undefined
  > {
    const database =
      await this.openDatabase();

    const result =
      await new Promise<
        AppMemoryEnvelope<T> | undefined
      >(
        (resolve, reject) => {
          const request =
            database
              .transaction(
                this.storeName,
                'readonly'
              )
              .objectStore(
                this.storeName
              )
              .get(key);

          request.onsuccess =
            () => resolve(
              request.result as
              AppMemoryEnvelope<T> |
              undefined
            );

          request.onerror =
            () => reject(
              request.error
            );
        }
      );

    database.close();

    return result;
  }

  private async indexedRemove(
    key: string
  ): Promise<void> {
    const database =
      await this.openDatabase();

    await new Promise<void>(
      (resolve, reject) => {
        const transaction =
          database.transaction(
            this.storeName,
            'readwrite'
          );

        transaction
          .objectStore(this.storeName)
          .delete(key);

        transaction.oncomplete =
          () => resolve();

        transaction.onerror =
          () => reject(
            transaction.error
          );
      }
    );

    database.close();
  }

  private async indexedClear():
    Promise<void> {
    const database =
      await this.openDatabase();

    await new Promise<void>(
      (resolve, reject) => {
        const transaction =
          database.transaction(
            this.storeName,
            'readwrite'
          );

        transaction
          .objectStore(this.storeName)
          .clear();

        transaction.oncomplete =
          () => resolve();

        transaction.onerror =
          () => reject(
            transaction.error
          );
      }
    );

    database.close();
  }
}