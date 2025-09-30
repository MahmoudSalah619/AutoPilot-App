import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/shared/components/ui';
import { COLORS } from '@/constants/Colors';
import { ServiceCardProps } from './types';
import styles from './styles';

export default function wwwServiceCard({ 
  title, 
  description, 
  iconName, 
  onPress, 
  color = COLORS.light.primary 
}: ServiceCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Feather 
          name={iconName as any} 
          size={24} 
          color={color} 
        />
      </View>
      
      <Text 
        size={14} 
        weight={600} 
        style={styles.titleText}
        autoTranslate={false}
      >
        {title}
      </Text>
      
      <Text 
        size={12} 
        color="grey70" 
        style={styles.descriptionText}
        autoTranslate={false}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );
}