import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/components/atoms';
import { COLORS } from '@/constants/Colors';
import { ProfileItemProps } from './types';
import styles from './styles';

export default function ProfileItem({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = true,
  color = COLORS.light.primary 
}: ProfileItemProps) {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Feather 
          name={icon as any} 
          size={20} 
          color={color} 
        />
      </View>
      
      <View style={styles.content}>
        <Text 
          size={16} 
          weight={500} 
          style={styles.title}
          autoTranslate={false}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            size={14} 
            color="grey70" 
            style={styles.subtitle}
            autoTranslate={false}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {showArrow && onPress && (
        <View style={styles.arrowContainer}>
          <Feather 
            name="chevron-right" 
            size={20} 
            color={COLORS.light.grey70} 
          />
        </View>
      )}
    </Container>
  );
}