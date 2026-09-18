import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import type { UserProfile } from '@/@types/models';
import { Avatar, Button, Card, Text } from '@/shared/components/ui';
import { formatDate } from '@/utils/format';

export interface ProfileHeaderProps {
  profile?: UserProfile;
  onEditPress: () => void;
}

/** Identity card at the top of the profile tab. */
export default function ProfileHeader({ profile, onEditPress }: ProfileHeaderProps) {
  const { t } = useTranslation();

  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';

  return (
    <Card padding="xl" style={{ alignItems: 'center', rowGap: SPACING.md }}>
      <Avatar name={fullName} uri={profile?.avatarUrl} size={72} />

      <View style={{ alignItems: 'center', rowGap: SPACING.xxs }}>
        <Text variant="h1" align="center">
          {fullName}
        </Text>
        <Text variant="bodySm" color="textSecondary" align="center">
          {profile?.email}
        </Text>
        {!!profile?.createdAt && (
          <Text variant="caption" color="textMuted" align="center">
            {t('profile.memberSince', { date: formatDate(profile.createdAt) })}
          </Text>
        )}
      </View>

      <Button variant="outline" size="sm" tx="profile.editProfile" onPress={onEditPress} />
    </Card>
  );
}
