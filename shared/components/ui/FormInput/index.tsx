import React from 'react';
import { Controller, type Control, type RegisterOptions } from 'react-hook-form';

import Input from '@/shared/components/ui/Input';
import type { InputProps } from '@/shared/components/ui/Input/types';

export interface FormInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<any>;
  name: string;
  rules?: RegisterOptions<any, string>;
  /** Overrides the message react-hook-form derives from `rules`. */
  error?: string;
}

/**
 * `Input` bound to react-hook-form.
 *
 * Validation messages are translation keys, resolved by `Input`, so screens no
 * longer hand-narrow `errors.field?.message` union types at every call site.
 */
export default function FormInput({
  control,
  name,
  rules,
  required,
  error,
  ...inputProps
}: FormInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{
        ...(required ? { required: 'validation.required' } : null),
        ...rules,
      }}
      render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <Input
          value={value == null ? '' : String(value)}
          onChangeText={onChange}
          onBlur={onBlur}
          required={required}
          error={error ?? fieldState.error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
