import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { dataTypeE } from '../../global/interface/data.enums';
import { dataRequiredType, datasGlobalI } from '../../global/interface/data.interface';
import {
  InputGroupEnum,
  InputTypeEnum
} from '../../global/interface/input-form.enum';

import {
  emptyMediaValue,
  InputMediaValueI
} from '../../global/interface/ui-runtime.interface';


const ruleValue = <T>(rule?: T | [T, string]): T | undefined => Array.isArray(rule) ? rule[0] : rule;

const requiredValue = (required?: dataRequiredType): boolean => Array.isArray(required) ? required[0] : required === true;

const dateLimit = (limit: unknown): number | null => {
  const raw = Array.isArray(limit) ? limit[0] : limit;
  const timestamp = raw instanceof Date ? raw.getTime() : new Date(String(raw)).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const dateValidator = (limit: unknown, mode: 'min' | 'max'): ValidatorFn => {
  const boundary = dateLimit(limit);

  return (control: AbstractControl): ValidationErrors | null => {
    if (boundary === null || control.value === null || control.value === '') return null;

    const value = new Date(control.value).getTime();

    if (Number.isNaN(value)) return { date: true };
    if (mode === 'min' && value < boundary) return { minDate: true };
    if (mode === 'max' && value > boundary) return { maxDate: true };

    return null;
  };
};
const mediaFiles = (
  value: unknown
): readonly File[] => {
  if (
    value &&
    typeof value === 'object' &&
    Array.isArray(
      (value as InputMediaValueI).files
    )
  ) {
    return (
      value as InputMediaValueI
    ).files;
  }

  return [];
};

const mediaExistingCount = (
  value: unknown
): number => {
  if (
    value &&
    typeof value === 'object' &&
    Array.isArray(
      (value as InputMediaValueI).existing
    )
  ) {
    return (
      value as InputMediaValueI
    ).existing.length;
  }

  return 0;
};

const mediaValidator = (
  dataKey: datasGlobalI
): ValidatorFn => {
  return (
    control: AbstractControl
  ): ValidationErrors | null => {
    const files = mediaFiles(control.value);

    const count =
      files.length +
      mediaExistingCount(control.value);

    const required =
      requiredValue(
        dataKey.controls?.required
      );

    const minFiles =
      ruleValue(dataKey.limits?.minFiles);

    const maxFiles =
      ruleValue(dataKey.limits?.maxFiles);

    const minSize =
      ruleValue(
        dataKey.limits?.minFileSize
      );

    const maxSize =
      ruleValue(
        dataKey.limits?.maxFileSize
      );

    const formats =
      dataKey.limits?.acceptedFormats ?? [];

    const extensions =
      (
        dataKey.limits
          ?.acceptedExtensions ?? []
      ).map(extension =>
        extension.toLowerCase()
      );

    if (required && count === 0) {
      return { required: true };
    }

    if (
      typeof minFiles === 'number' &&
      count < minFiles
    ) {
      return { mediaCount: true };
    }

    if (
      typeof maxFiles === 'number' &&
      count > maxFiles
    ) {
      return { mediaCount: true };
    }

    for (const file of files) {
      if (
        typeof minSize === 'number' &&
        file.size < minSize
      ) {
        return { mediaSize: true };
      }

      if (
        typeof maxSize === 'number' &&
        file.size > maxSize
      ) {
        return { mediaSize: true };
      }

      if (
        formats.length > 0 &&
        !formats.includes(file.type)
      ) {
        return { mediaType: true };
      }

      if (
        extensions.length > 0 &&
        !extensions.some(extension =>
          file.name.toLowerCase()
            .endsWith(extension)
        )
      ) {
        return { mediaType: true };
      }
    }

    return null;
  };
};

















export function inputValidators(dataKey: datasGlobalI): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  const controls = dataKey.controls;
  const limits = dataKey.limits;
if (
  dataKey.inputGroup === InputGroupEnum.Media
) {
  validators.push(mediaValidator(dataKey));
  return validators;
}

  if (requiredValue(controls?.required)) validators.push(Validators.required);
  if (limits?.pattern) validators.push(Validators.pattern(limits.pattern));

  if (dataKey.dataType === dataTypeE.Date) {
    if (limits?.min !== undefined) validators.push(dateValidator(limits.min, 'min'));
    if (limits?.max !== undefined) validators.push(dateValidator(limits.max, 'max'));
  } else {
    const min = ruleValue(limits?.min as number | [number, string] | undefined);
    const max = ruleValue(limits?.max as number | [number, string] | undefined);

    if (typeof min === 'number') validators.push(Validators.min(min));
    if (typeof max === 'number') validators.push(Validators.max(max));
  }

  const minLength = ruleValue(limits?.minLength);
  const maxLength = ruleValue(limits?.maxLength);
  const minItems = ruleValue(limits?.minItems);
  const maxItems = ruleValue(limits?.maxItems);

  if (typeof minLength === 'number') validators.push(Validators.minLength(minLength));
  if (typeof maxLength === 'number') validators.push(Validators.maxLength(maxLength));
  if (typeof minItems === 'number') validators.push(Validators.minLength(minItems));
  if (typeof maxItems === 'number') validators.push(Validators.maxLength(maxItems));

  return validators;
}

export function inputDefaultValue(dataKey: datasGlobalI): unknown {
  if (dataKey.default !== undefined) {
    return dataKey.dataType === dataTypeE.Date && typeof dataKey.default === 'string'
      ? new Date(dataKey.default)
      : dataKey.default;
  }
  if (
    dataKey.inputGroup === InputGroupEnum.Media
  ) {
    return emptyMediaValue();
  }

  switch (dataKey.inputType) {
    case InputTypeEnum.MultiSelect:
    case InputTypeEnum.Checkbox:
      return [];

    case InputTypeEnum.RangeSlider:
      return [
        Number(ruleValue(dataKey.limits?.min as number | [number, string] | undefined) ?? 0),
        Number(ruleValue(dataKey.limits?.max as number | [number, string] | undefined) ?? 100)
      ];

    case InputTypeEnum.ToggleSwitch:
      return false;

    default:
      return null;
  }
}

export function createInputControl(dataKey: datasGlobalI, value?: unknown): FormControl {
  return new FormControl(
    {
      value: value !== undefined ? value : inputDefaultValue(dataKey),
      disabled: dataKey.controls?.disabled === true
    },
    inputValidators(dataKey)
  );
}