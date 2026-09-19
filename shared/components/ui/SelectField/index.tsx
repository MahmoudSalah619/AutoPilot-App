import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Sheet from '@/shared/components/layout/Sheet';
import EmptyState from '@/shared/components/ui/EmptyState';
import Input from '@/shared/components/ui/Input';
import ListRow from '@/shared/components/ui/ListRow';
import Text from '@/shared/components/ui/Text';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  labelTx?: string;
  placeholderTx?: string;
  /** Sheet heading. Defaults to the field label. */
  titleTx?: string;
  error?: string;
  hintTx?: string;
  required?: boolean;
  disabled?: boolean;
  /** Shows the search box. Defaults to on once the list gets long. */
  searchable?: boolean;
  isLoading?: boolean;
  containerStyle?: React.ComponentProps<typeof View>['style'];
  testID?: string;
}

/** Above this many options, scanning the list stops being practical. */
const SEARCH_THRESHOLD = 8;

/**
 * Single-choice field backed by a searchable sheet.
 *
 * For lists too long for `OptionGroup` — the 65-row car make catalogue being
 * the case that prompted it. The closed state is an `Input` rendered
 * read-only so the field lines up with the text inputs beside it in a form.
 */
export default function SelectField({
  options,
  value,
  onChange,
  label,
  labelTx,
  placeholderTx,
  titleTx,
  error,
  hintTx,
  required = false,
  disabled = false,
  searchable,
  isLoading = false,
  containerStyle,
  testID,
}: SelectFieldProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const showSearch = searchable ?? options.length > SEARCH_THRESHOLD;

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? value ?? '',
    [options, value]
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;

    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query]);

  const close = () => {
    setIsOpen(false);
    // Cleared on close, so reopening never starts inside a stale filter.
    setQuery('');
  };

  const select = (next: string) => {
    onChange(next);
    close();
  };

  return (
    <View style={containerStyle}>
      <Pressable
        testID={testID}
        onPress={() => setIsOpen(true)}
        disabled={disabled || isLoading}
        accessibilityRole="button"
        accessibilityLabel={labelTx ? t(labelTx) : label}
        accessibilityState={{ disabled: disabled || isLoading, expanded: isOpen }}
      >
        {/* Not editable: the Pressable owns the interaction, the Input only
            supplies the label, error and border treatment the form expects. */}
        <View pointerEvents="none">
          <Input
            label={label}
            labelTx={labelTx}
            placeholderTx={placeholderTx}
            value={selectedLabel}
            editable={false}
            required={required}
            error={error}
            hintTx={hintTx}
            suffix={<Feather name="chevron-down" size={18} color={colors.textMuted} />}
          />
        </View>
      </Pressable>

      <Sheet
        isVisible={isOpen}
        onClose={close}
        titleTx={titleTx ?? labelTx}
        flush
        maxHeightRatio={0.8}
      >
        {showSearch && (
          <View style={{ paddingHorizontal: SPACING.xl }}>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholderTx="common.search"
              autoCapitalize="none"
              autoCorrect={false}
              prefix={<Feather name="search" size={16} color={colors.textMuted} />}
            />
          </View>
        )}

        {results.length === 0 ? (
          <View style={{ paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl }}>
            <EmptyState icon="search" titleTx="common.noResults" />
          </View>
        ) : (
          <FlashList
            data={results}
            estimatedItemSize={60}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ListRow
                title={item.label}
                onPress={() => select(item.value)}
                showChevron={false}
                style={{ paddingHorizontal: SPACING.xl }}
                right={
                  item.value === value ? (
                    <Feather name="check" size={18} color={colors.primary} />
                  ) : undefined
                }
              />
            )}
            ItemSeparatorComponent={() => (
              <View style={{ backgroundColor: colors.border, height: 1, marginLeft: SPACING.xl }} />
            )}
          />
        )}

        {isLoading && (
          <View style={{ padding: SPACING.xl }}>
            <Text variant="bodySm" color="textSecondary" tx="common.loading" />
          </View>
        )}
      </Sheet>
    </View>
  );
}
