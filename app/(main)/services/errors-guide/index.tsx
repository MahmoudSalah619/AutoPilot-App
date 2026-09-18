import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { useSearchDiagnosticCodesQuery } from '@/apis/autopilotApi';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { DiagnosticCode, DiagnosticSystem } from '@/@types/models';
import { Screen } from '@/shared/components/layout';
import { Chip, EmptyState, Input, SkeletonCard, Text } from '@/shared/components/ui';
import { DiagnosticCard, DiagnosticDetailSheet } from '@/features/services/diagnostics';

const SYSTEMS: DiagnosticSystem[] = [
  'engine',
  'transmission',
  'emissions',
  'brakes',
  'electrical',
  'fuel',
  'cooling',
  'body',
];

export default function ErrorsGuide() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [search, setSearch] = useState('');
  const [system, setSystem] = useState<DiagnosticSystem | null>(null);
  const [selected, setSelected] = useState<DiagnosticCode | undefined>();

  // The field stays controlled; only the query waits for typing to settle.
  const debouncedSearch = useDebouncedValue(search, 250);

  const filter = useMemo(
    () => ({ search: debouncedSearch || undefined, system: system ?? undefined }),
    [debouncedSearch, system]
  );

  const { data: results = [], isLoading, isFetching } = useSearchDiagnosticCodesQuery(filter);

  const hasQuery = Boolean(search) || Boolean(system);

  return (
    <Screen
      padded={false}
      header={{
        titleTx: 'errorsGuide.title',
        subtitleTx: 'errorsGuide.subtitle',
        variant: 'large',
      }}
    >
      <View style={{ paddingHorizontal: SPACING.screen, rowGap: SPACING.md }}>
        <Input
          placeholderTx="errorsGuide.searchPlaceholder"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          prefix={<Feather name="search" size={18} color={colors.textMuted} />}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[null, ...SYSTEMS]}
          keyExtractor={(item) => item ?? 'all'}
          contentContainerStyle={{ columnGap: SPACING.sm }}
          renderItem={({ item }) => (
            <Chip
              tx={item ? `errorsGuide.systems.${item}` : 'errorsGuide.allSystems'}
              selected={system === item}
              onPress={() => setSystem(item)}
            />
          )}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(entry) => entry.code}
        renderItem={({ item }) => <DiagnosticCard entry={item} onPress={() => setSelected(item)} />}
        contentContainerStyle={{
          paddingBottom: SPACING.huge,
          paddingHorizontal: SPACING.screen,
          paddingTop: SPACING.md,
          rowGap: SPACING.md,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          results.length > 0 && hasQuery ? (
            <Text variant="caption" color="textMuted" style={{ paddingBottom: SPACING.xs }}>
              {t('errorsGuide.resultCount', { count: results.length })}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          isLoading || isFetching ? (
            <SkeletonCard count={3} />
          ) : hasQuery ? (
            <EmptyState
              layout="inline"
              icon="search"
              titleTx="errorsGuide.noResultsTitle"
              bodyTx="errorsGuide.noResultsBody"
              actionTx="common.clearAll"
              onAction={() => {
                setSearch('');
                setSystem(null);
              }}
            />
          ) : (
            <EmptyState
              layout="inline"
              icon="alert-triangle"
              titleTx="errorsGuide.startTitle"
              bodyTx="errorsGuide.startBody"
            />
          )
        }
      />

      <DiagnosticDetailSheet
        entry={selected}
        onClose={() => setSelected(undefined)}
        onLogService={() => {
          setSelected(undefined);
          router.push('/(main)/(tabs)/Maintenance');
        }}
      />
    </Screen>
  );
}
