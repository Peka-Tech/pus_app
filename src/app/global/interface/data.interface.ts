
import {
  dataTypeE,
  UIActionEnum,
  UIAlignEnum,
  UIComponentEnum,
  UIOrientationEnum,
  UIPositionEnum,
  UISeverityEnum,
  UISizeEnum,
  UISortDirectionEnum,
  UIVariantEnum,
  UIViewModeEnum,
  MediaPreviewShapeEnum,
  MediaUploadModeEnum,
  UIPresentationModeEnum
} from './data.enums';

import { InputGroupEnum, InputTypeEnum } from './input-form.enum';

export type dataIndexType = boolean | 'text' | 'hashed' | 1 | -1;
export type dataRequiredType = boolean | [boolean, string];
export type dataNumberRule = number | [number, string];
export type dataLengthRule = dataNumberRule;
export type dataDateRule = string | Date | [string | Date, string];

export interface dataControlI {
  required?: dataRequiredType;
  unique?: boolean;
  generateId?: boolean;
  index?: dataIndexType;
  sparse?: boolean;
  select?: boolean;
  immutable?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;

  uiStatic?: boolean;
  resourceStatic?: boolean;

  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  loading?: boolean;

  selected?: boolean;
  selectionOnly?: boolean;
  selectable?: boolean;

  showBack?: boolean;
  showClear?: boolean;
  filter?: boolean;
  feedback?: boolean;
  toggleMask?: boolean;

  autoFocus?: boolean;
  indeterminate?: boolean;
  multiple?: boolean;
  inline?: boolean;

  paginator?: boolean;
  lazy?: boolean;
  sortable?: boolean;

  stripedRows?: boolean;
  showGridlines?: boolean;
  hoverable?: boolean;

  resizable?: boolean;
  reorderable?: boolean;

  closable?: boolean;
  closeOnEscape?: boolean;
  dismissibleMask?: boolean;

  lockWhileSubmitting?: boolean;
  waitForServerResponse?: boolean;
  closeOnSuccess?: boolean;
  confirmPassword?: boolean;
  showFeedback?: boolean;

  preview?: boolean;
  allowUpload?: boolean;
  allowRemove?: boolean;
  captureCamera?: boolean;
  dragAndDrop?: boolean;
}

export interface dataLimitI {
  min?: dataNumberRule | dataDateRule;
  max?: dataNumberRule | dataDateRule;

  minLength?: dataLengthRule;
  maxLength?: dataLengthRule;

  minItems?: dataLengthRule;
  maxItems?: dataLengthRule;

  step?: number;

  expires?: number | string;
  precision?: number;
  pattern?: string;

  minFileSize?: dataNumberRule;
  maxFileSize?: dataNumberRule;
  minFiles?: dataLengthRule;
  maxFiles?: dataLengthRule;

  acceptedFormats?: string[];
  acceptedExtensions?: string[];
}

export interface dataConfigurationsI {
  placeholder?: string;
  autoComplete?: string;

  alias?: string;
  prefix?: string;
  suffix?: string;

  icon?: string;

  colorValue?: string;
  bgColorValue?: string;
  className?: string;

  selectionMode?: 'single' | 'multiple' | 'checkbox';

  rows?: number;

  minFractionDigits?: number;
  maxFractionDigits?: number;

  mask?: string;
  dateFormat?: string;

  size?: UISizeEnum;
  severity?: UISeverityEnum;
  variant?: UIVariantEnum;

  position?: UIPositionEnum;
  align?: UIAlignEnum;
  orientation?: UIOrientationEnum;

  action?: UIActionEnum;

  debounce?: number;

  count?: number;
  selectedCount?: number;

  sortDirection?: UISortDirectionEnum;
  viewMode?: UIViewModeEnum;

  pageSize?: number;
  pageIndex?: number;
  totalRecords?: number;
  rowsPerPageOptions?: number[];

  trackBy?: string;

  presentationMode?: UIPresentationModeEnum;

  modalTitle?: string;
  modalWidth?: string;

  uploadMode?: MediaUploadModeEnum;
  previewShape?: MediaPreviewShapeEnum;
  capture?: 'user' | 'environment';
}

export interface dataMatchI {
  registryKey: string;
  message?: string;
}

export interface dataEnumI<T = unknown> {
  values: T[];
  message?: string;
}

export interface datasGlobalI<T = unknown, TId = string> {
  _id: TId;
  name: string;
  description: string;

  dataType: dataTypeE;
  dataKey: string;

  imageUrl?: string;

  database?: string;
  collection?: string;

  label?: string;

  value?: T;
  default?: T;

  modelId?: TId[];
  schemaId?: TId[];
  keyId?: TId[];
  child?: TId[];

  inputs?: datasGlobalI<unknown, TId>[];
  buttons?: datasGlobalI<unknown, TId>[];

  columns?: datasGlobalI<unknown, TId>[];

  uiComponent?: UIComponentEnum;

  inputGroup?: InputGroupEnum;
  inputType?: InputTypeEnum;

  controls?: dataControlI;
  limits?: dataLimitI;
  configurations?: dataConfigurationsI;

  resources?: Record<string, unknown>[];

  match?: dataMatchI;

  enum?: T[] | dataEnumI<T>;

  ref?: string;
  refPath?: string;

  validatorId?: TId[];
  getterId?: TId;
  setterId?: TId;
}
