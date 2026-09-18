import React from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import { RADIUS } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';

export interface AvatarProps {
  /** Full name. Initials are derived from it when no image is given. */
  name?: string;
  uri?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Derives up to two initials, e.g. "Mahmoud Salah" becomes "MS". */
function toInitials(name?: string): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Circular profile image, falling back to initials on the brand tint. */
export default function Avatar({ name, uri, size = 56, style }: AvatarProps) {
  const { colors } = useTheme();

  const base: ViewStyle = {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: RADIUS.pill,
    height: size,
    justifyContent: 'center',
    overflow: 'hidden',
    width: size,
  };

  if (uri) {
    return (
      <View style={[base, style]}>
        <Image
          source={{ uri }}
          accessibilityIgnoresInvertColors
          resizeMode="cover"
          style={{ height: size, width: size }}
        />
      </View>
    );
  }

  return (
    <View style={[base, style]}>
      <Text variant="h2" color="primary" size={size * 0.36}>
        {toInitials(name)}
      </Text>
    </View>
  );
}
