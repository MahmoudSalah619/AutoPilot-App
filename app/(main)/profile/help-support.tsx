import React, { useMemo, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import IMPORTANT_VARS from '@/constants/ImportantVars';
import { useTheme } from '@/theme';
import { Screen } from '@/shared/components/layout';
import { Card, Divider, EmptyState, Input, ListRow, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { SettingsGroup } from '@/features/profile';

/** FAQ entries live as translation-key pairs so both languages stay in sync. */
const FAQ_KEYS = ['1', '2', '3', '4', '5', '6'] as const;

export default function HelpSupport() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [search, setSearch] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const faq = useMemo(() => {
    const entries = FAQ_KEYS.map((key) => ({
      key,
      question: t(`help.faq.q${key}`),
      answer: t(`help.faq.a${key}`),
    }));

    const needle = search.trim().toLowerCase();
    if (!needle) return entries;

    return entries.filter(
      (entry) =>
        entry.question.toLowerCase().includes(needle) || entry.answer.toLowerCase().includes(needle)
    );
  }, [search, t]);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => toast.error(t('errors.unexpected')));
  };

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'help.title' }}>
      <Text variant="body" color="textSecondary" tx="help.subtitle" />

      <Input
        placeholderTx="help.searchPlaceholder"
        value={search}
        onChangeText={setSearch}
        prefix={<Feather name="search" size={18} color={colors.textMuted} />}
      />

      <View style={{ rowGap: SPACING.md }}>
        <Text variant="h2" tx="help.faqTitle" />

        {faq.length === 0 ? (
          <Card variant="outlined">
            <EmptyState
              layout="inline"
              icon="search"
              titleTx="help.noResultsTitle"
              bodyTx="help.noResultsBody"
            />
          </Card>
        ) : (
          <Card padding="md">
            {faq.map((entry, index) => {
              const isExpanded = expandedKey === entry.key;

              return (
                <View key={entry.key}>
                  {index > 0 && <Divider />}

                  <Pressable
                    onPress={() => setExpandedKey(isExpanded ? null : entry.key)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                    style={({ pressed }) => [
                      { paddingVertical: SPACING.md, rowGap: SPACING.sm },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <View
                      style={{
                        alignItems: 'center',
                        columnGap: SPACING.md,
                        flexDirection: 'row',
                      }}
                    >
                      <Text variant="h3" style={{ flex: 1 }}>
                        {entry.question}
                      </Text>
                      <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </View>

                    {isExpanded && (
                      <Text variant="bodySm" color="textSecondary">
                        {entry.answer}
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </Card>
        )}
      </View>

      <SettingsGroup titleTx="help.contactTitle">
        <ListRow
          icon="mail"
          titleTx="help.emailUs"
          subtitleTx="help.emailUsBody"
          onPress={() =>
            openLink(
              `mailto:${IMPORTANT_VARS.supportEmail}?subject=${encodeURIComponent(
                `${IMPORTANT_VARS.appName} support`
              )}`
            )
          }
        />
        <ListRow
          icon="message-circle"
          iconTone="accentGreen"
          iconBackground="accentGreenSoft"
          titleTx="help.whatsapp"
          subtitleTx="help.whatsappBody"
          onPress={() => openLink(IMPORTANT_VARS.supportWhatsApp)}
        />
        <ListRow
          icon="alert-octagon"
          iconTone="accentAmber"
          iconBackground="accentAmberSoft"
          titleTx="help.reportBug"
          subtitleTx="help.reportBugBody"
          onPress={() =>
            openLink(
              `mailto:${IMPORTANT_VARS.supportEmail}?subject=${encodeURIComponent(
                `${IMPORTANT_VARS.appName} bug report`
              )}`
            )
          }
        />
        <ListRow
          icon="star"
          iconTone="accentAmber"
          iconBackground="accentAmberSoft"
          titleTx="help.rateApp"
          subtitleTx="help.rateAppBody"
          onPress={() => openLink(IMPORTANT_VARS.androidStoreLink)}
        />
      </SettingsGroup>
    </Screen>
  );
}
