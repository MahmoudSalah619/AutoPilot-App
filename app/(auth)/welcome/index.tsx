import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text } from '@/components/atoms';
import AuthScreenWrapper from '@/components/templates/AuthScreenWrapper';
import GLOBAL_STYLES from '@/constants/GlobalStyles';

const Welcome = () => {
  const router = useRouter();

  return (
    <AuthScreenWrapper paddingSize="sm" isScrollable>
      <View style={styles.container}>
        <View style={GLOBAL_STYLES.gap16}>
          <View style={[GLOBAL_STYLES.row, GLOBAL_STYLES.gap4, styles.title]}>
            <Text size={24} weight={700}>
              Welcome to
            </Text>
            <Text size={24} weight={800} color="primary" style={styles.title}>
              AutoPilot
            </Text>
          </View>
          <Text color="grey70" lineHeight={24} style={styles.desc}>
            Track your car’s kilometers, keep up with services, and get simple reminders for
            maintenance. From oil changes to tire checks, we’ve got your back so your car stays
            happy and healthy.
          </Text>
          <Text size={18} weight={700} lineHeight={21}>
            Why AutoPilot? 💡
          </Text>
          <View style={GLOBAL_STYLES.gap16}>
            <Text color="grey70" weight={500}>
              📏 Track kilometers so you always know when service is due.{' '}
            </Text>
            <Text color="grey70" weight={500}>
              🛠️ Stay on top of maintenance with simple reminders.{' '}
            </Text>
            <Text color="grey70" weight={500}>
              💰 Save money by preventing small issues from becoming big problems.{' '}
            </Text>
            <Text color="grey70" weight={500}>
              😌 Drive stress-free knowing your car is always in good hands.{' '}
            </Text>
          </View>
        </View>
        <View style={GLOBAL_STYLES.gap16}>
          <Button title="Get started" onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    </AuthScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  title: {
    margin: 'auto',
  },
  desc: {
    textAlign: 'center',
  },
});

export default Welcome;
