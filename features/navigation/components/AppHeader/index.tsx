import { Keyboard, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/Colors';

import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { Logo, Text } from '@/shared/components/ui';
import { ThemedView } from '@/shared/components/layout';
import { UnreadMessages, NotificationBell } from '@/features/notifications';
import styles from './styles';

export default function NavigationHeader({
  title = '',
  hasBackArrow = true,
  hasLogo = false,
  isRightComponentHidden = false,
  onPress = () => {},
}) {
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? 'light';

  const isBackButtonVisible = hasBackArrow && navigation.canGoBack();

  return (
    <ThemedView style={[styles.headerStyle]}>
      {/* BACK BUTTON */}
      <TouchableOpacity
        disabled={!isBackButtonVisible}
        style={[styles.spacing, !isBackButtonVisible && styles.hiddenStyle]}
        onPress={navigation.goBack}
      >
        <Feather name={'chevron-left'} size={32} color={COLORS[colorScheme]['text']} />
      </TouchableOpacity>

      {/* CENTER COMPONENT */}
      <View>
        {!!title && !hasLogo && (
          <TouchableOpacity
            onPress={() => {
              onPress();
              Keyboard.dismiss();
            }}
          >
            <Text>{title}</Text>
          </TouchableOpacity>
        )}
        {!!hasLogo && (
          <View style={{ padding: 8 }}>
            <Logo width={120} height={80} />
          </View>
        )}
      </View>

      {/* RIGHT COMPONENT */}
      <View
        pointerEvents={isRightComponentHidden ? 'none' : undefined}
        style={[isRightComponentHidden && styles.hiddenStyle]}
      >
        <View style={styles.NotiNum}>
          <UnreadMessages number={2} backgroundColor={COLORS.light.primary} />
        </View>
        <NotificationBell />
      </View>
    </ThemedView>
  );
}
