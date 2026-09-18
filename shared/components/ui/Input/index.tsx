import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { I18nManager, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { TYPOGRAPHY } from '@/constants/Typography';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { InputProps } from './types';
import styles from './styles';

/**
 * Text field with label, hint, error and focus states.
 *
 * Non-editable fields render on the sunken surface rather than the card
 * surface, which is how the profile and vehicle screens signal their
 * view/edit toggle without swapping components.
 */
export default function Input({
  label,
  labelTx,
  placeholder,
  placeholderTx,
  error,
  hint,
  hintTx,
  onChangeText,
  prefix,
  suffix,
  multilineBox = false,
  required = false,
  debounceMs = 0,
  editable = true,
  secureTextEntry = false,
  containerStyle,
  inputStyle,
  ...rest
}: InputProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChangeText = useCallback(
    (value: string) => {
      if (!onChangeText) return;

      if (debounceMs > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onChangeText(value), debounceMs);
        return;
      }

      onChangeText(value);
    },
    [onChangeText, debounceMs]
  );

  const hasError = Boolean(error);

  const borderColor = useMemo(() => {
    if (hasError) return colors.danger;
    if (isFocused) return colors.primary;
    return colors.border;
  }, [hasError, isFocused, colors]);

  const resolvedLabel = labelTx ? t(labelTx) : label;
  const resolvedPlaceholder = placeholderTx ? t(placeholderTx) : placeholder;
  const resolvedHint = hintTx ? t(hintTx) : hint;
  const resolvedError = hasError ? t(error as string, { defaultValue: error }) : undefined;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {!!resolvedLabel && (
        <View style={styles.labelRow}>
          <Text variant="label" color="textSecondary">
            {resolvedLabel}
          </Text>
          {required ? (
            <Text variant="label" color="danger">
              {' *'}
            </Text>
          ) : null}
        </View>
      )}

      <View
        style={[
          styles.field,
          {
            backgroundColor: editable ? colors.surface : colors.surfaceAlt,
            borderColor,
            borderRadius: RADIUS.md,
            columnGap: SPACING.sm,
          },
          multilineBox && styles.multilineField,
        ]}
      >
        {!!prefix && <View style={styles.adornment}>{prefix}</View>}

        <TextInput
          style={[
            styles.input,
            TYPOGRAPHY.body,
            {
              color: editable ? colors.text : colors.textSecondary,
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            },
            multilineBox && styles.multilineInput,
            inputStyle,
          ]}
          placeholder={resolvedPlaceholder}
          placeholderTextColor={colors.textDisabled}
          editable={editable}
          multiline={multilineBox}
          numberOfLines={multilineBox ? 4 : 1}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          autoCorrect={false}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsSecureVisible((visible) => !visible)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t(isSecureVisible ? 'common.hidePassword' : 'common.showPassword')}
          >
            <Ionicons
              name={isSecureVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : (
          !!suffix && <View style={styles.adornment}>{suffix}</View>
        )}
      </View>

      {hasError || !!resolvedHint ? (
        <Text variant="caption" color={hasError ? 'danger' : 'textMuted'}>
          {hasError ? resolvedError : resolvedHint}
        </Text>
      ) : null}
    </View>
  );
}
