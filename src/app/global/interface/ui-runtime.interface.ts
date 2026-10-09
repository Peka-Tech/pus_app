import { datasGlobalI } from './data.interface';
import { UIRequestStatusEnum } from './data.enums';

export type UIFeedbackSeverity =
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

export interface UIFeedbackI {
  severity: UIFeedbackSeverity;
  title?: string;
  message: string;
  code?: string;
  field?: string;
  duration?: number;
}

export interface UIRequestStateI {
  status: UIRequestStatusEnum;
  feedback?: UIFeedbackI;
}

export interface UISubmitRequestI {
  definition: datasGlobalI;
  value: Record<string, unknown>;
  confirmation?: {
    password: string;
  };
}

export interface MediaResourceI {
  id?: string;
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

export interface InputMediaValueI {
  files: readonly File[];
  existing: readonly MediaResourceI[];
  removed: readonly MediaResourceI[];
}

export function emptyMediaValue(): InputMediaValueI {
  return {
    files: [],
    existing: [],
    removed: []
  };
}