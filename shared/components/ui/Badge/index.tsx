import React from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/components/ui';
import { COLORS } from '@/constants/Colors';
import { BadgeProps } from './types';
import styles from './styles';

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const badgeStyle = variant === 'default' ? styles.default : styles.secondary;
  
  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text 
        size={12} 
        weight={500} 
        color={variant === 'default' ? 'white' : 'grey70'}
        autoTranslate={false}
      >
        {children}
      </Text>
    </View>
  );
}