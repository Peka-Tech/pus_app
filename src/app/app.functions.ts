import {
  ServerRequestActionEnum
} from './global/interface/server.enum';

export type AppDataKey = string | number;

export type AppDataAction =
  | ServerRequestActionEnum.Create
  | ServerRequestActionEnum.CreateMany
  | ServerRequestActionEnum.Add
  | ServerRequestActionEnum.Update
  | ServerRequestActionEnum.UpdateMany
  | ServerRequestActionEnum.Replace
  | ServerRequestActionEnum.Delete
  | ServerRequestActionEnum.DeleteMany
  | ServerRequestActionEnum.Remove
  | ServerRequestActionEnum.Duplicate
  | ServerRequestActionEnum.Clone
  | ServerRequestActionEnum.Copy;

export interface AppFieldDifference {
  before: unknown;
  after: unknown;
}

export interface AppUpdatedDifference<T> {
  before: T;
  after: T;
  changes: Record<string, AppFieldDifference>;
}

export interface AppDataDifference<T> {
  added: T[];
  updated: AppUpdatedDifference<T>[];
  removed: T[];
}

export interface AppDataResult<T> {
  success: boolean;
  action: AppDataAction;
  previous: T[];
  current: T[];
  difference: AppDataDifference<T>;
  error?: string;
}

export interface AppDataOptions<T> {
  key: keyof T;
  replace?: boolean;
  createKey?: (
    source: T,
    index: number
  ) => T[keyof T];
}

const emptyDifference = <T>(): AppDataDifference<T> => ({
  added: [],
  updated: [],
  removed: []
});

const failure = <T>(
  action: AppDataAction,
  previous: readonly T[],
  error: string
): AppDataResult<T> => ({
  success: false,
  action,
  previous: [...previous],
  current: [...previous],
  difference: emptyDifference<T>(),
  error
});

const values = <T>(
  payload: T | readonly T[]
): T[] => Array.isArray(payload)
  ? [...payload] as T[]
  : [payload as T];

const identity = <T>(
  item: T,
  key: keyof T
): unknown => item[key];

const validIdentity = (
  value: unknown
): value is AppDataKey =>
  typeof value === 'string' ||
  typeof value === 'number';

const changes = <T extends object>(
  before: T,
  after: T
): Record<string, AppFieldDifference> => {
  const result: Record<string, AppFieldDifference> = {};

  const keys = new Set([
    ...Object.keys(before),
    ...Object.keys(after)
  ]);

  for (const key of keys) {
    const previous = Reflect.get(before, key);
    const current = Reflect.get(after, key);

    if (!Object.is(previous, current)) {
      result[key] = {
        before: previous,
        after: current
      };
    }
  }

  return result;
};

export function app_manipulateData<
  T extends object
>(
  action: AppDataAction,
  previous: readonly T[],
  payload: T | readonly T[],
  options: AppDataOptions<T>
): AppDataResult<T> {
  const incoming = values(payload);
  const before = [...previous];
  const difference = emptyDifference<T>();

  if (incoming.length === 0) {
    return failure(
      action,
      before,
      'Aucune donnée à manipuler.'
    );
  }

  switch (action) {
    case ServerRequestActionEnum.Create:
    case ServerRequestActionEnum.CreateMany:
    case ServerRequestActionEnum.Add: {
      const current = [...before];

      for (const item of incoming) {
        const id = identity(item, options.key);

        if (!validIdentity(id)) {
          return failure(
            action,
            before,
            `Identifiant '${String(options.key)}' invalide.`
          );
        }

        if (
          current.some(
            currentItem =>
              identity(currentItem, options.key) === id
          )
        ) {
          return failure(
            action,
            before,
            `L'identifiant '${String(id)}' existe déjà.`
          );
        }

        current.push(item);
        difference.added.push(item);
      }

      return {
        success: true,
        action,
        previous: before,
        current,
        difference
      };
    }

    case ServerRequestActionEnum.Update:
    case ServerRequestActionEnum.UpdateMany:
    case ServerRequestActionEnum.Replace: {
      const current = [...before];

      for (const patch of incoming) {
        const id = identity(patch, options.key);

        if (!validIdentity(id)) {
          return failure(
            action,
            before,
            `Identifiant '${String(options.key)}' invalide.`
          );
        }

        const index = current.findIndex(
          item => identity(item, options.key) === id
        );

        if (index < 0) {
          return failure(
            action,
            before,
            `La ressource '${String(id)}' est introuvable.`
          );
        }

        const oldValue = current[index];

        const newValue = (
          action === ServerRequestActionEnum.Replace ||
          options.replace === true
        )
          ? patch
          : {
              ...oldValue,
              ...patch
            };

        current[index] = newValue;

        const fieldChanges = changes(
          oldValue,
          newValue
        );

        if (Object.keys(fieldChanges).length > 0) {
          difference.updated.push({
            before: oldValue,
            after: newValue,
            changes: fieldChanges
          });
        }
      }

      return {
        success: true,
        action,
        previous: before,
        current,
        difference
      };
    }

    case ServerRequestActionEnum.Delete:
    case ServerRequestActionEnum.DeleteMany:
    case ServerRequestActionEnum.Remove: {
      const ids = new Set<unknown>();

      for (const item of incoming) {
        const id = identity(item, options.key);

        if (!validIdentity(id)) {
          return failure(
            action,
            before,
            `Identifiant '${String(options.key)}' invalide.`
          );
        }

        ids.add(id);
      }

      const removed = before.filter(
        item => ids.has(identity(item, options.key))
      );

      if (removed.length !== ids.size) {
        return failure(
          action,
          before,
          'Une ou plusieurs ressources sont introuvables.'
        );
      }

      difference.removed.push(...removed);

      return {
        success: true,
        action,
        previous: before,
        current: before.filter(
          item => !ids.has(identity(item, options.key))
        ),
        difference
      };
    }

    case ServerRequestActionEnum.Duplicate:
    case ServerRequestActionEnum.Clone:
    case ServerRequestActionEnum.Copy: {
      if (!options.createKey) {
        return failure(
          action,
          before,
          'createKey est obligatoire pour dupliquer une ressource.'
        );
      }

      const current = [...before];

      incoming.forEach((source, index) => {
        const clone = {
          ...source,
          [options.key]: options.createKey?.(
            source,
            index
          )
        } as T;

        const id = identity(clone, options.key);

        if (!validIdentity(id)) {
          return;
        }

        current.push(clone);
        difference.added.push(clone);
      });

      if (difference.added.length !== incoming.length) {
        return failure(
          action,
          before,
          'Impossible de générer les nouveaux identifiants.'
        );
      }

      return {
        success: true,
        action,
        previous: before,
        current,
        difference
      };
    }
  }
}