import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/components/atoms';
import { useThemeColor } from '@/hooks/useThemeColor';

const VehicleDocuments = () => {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Feather name="file-text" size={64} color="#4ECDC4" />
        <Text size={18} weight={600} style={styles.title} autoTranslate={false}>
          Vehicle Documents
        </Text>
        <Text size={14} color="grey70" style={styles.subtitle} autoTranslate={false}>
          Store and manage your car papers securely. Coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    textAlign: 'center' as const,
    lineHeight: 20,
  },
};

export default VehicleDocuments;
