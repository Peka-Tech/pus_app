import { ServerRequestActionEnum, ServerResponseTypeEnum } from './server.enum';

export interface ServerRequestInterface<T = unknown> {
  module: string;
  resource: string;
  action: ServerRequestActionEnum;
  datas?: T[];
  meta?: ServerRequestMetaInterface;
}

export interface ServerRequestMetaInterface {
  page?: number;
  limit?: number;
  sort?: Record<string, 1|-1>;
  filters?: Record<string, unknown>;
  fields?: string[];
}

export interface ServerResponseInterface<T = unknown> {
  success: boolean;
  status: number;
  type?: ServerResponseTypeEnum;
  message?: string;
  datas?: T[];
  meta?: ServerResponseMetaInterface;
  errors?: ServerErrorInterface[];
  timestamp: string;
}

export interface ServerResponseMetaInterface {
  count?: number;
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  sort?: Record<string, 1|-1>;
  filters?: Record<string, unknown>;
  durationMs?: number;
}

export interface ServerErrorInterface {
  code?: string;
  field?: string;
  message: string;
  value?: unknown;
  details?: unknown;
}