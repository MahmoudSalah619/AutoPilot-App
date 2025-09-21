import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/components/atoms';
import { COLORS } from '@/constants/Colors';
import { ProfileHeaderProps } from './types';
import styles from './styles';

export default function ProfileHeader({ 
  name, 
  email, 
  avatarUrl, 
  onEditPress 
}: ProfileHeaderProps) {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          // In a real app, you'd use an Image component here
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        ) : (
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        )}
      </View>
      
      <Text 
        size={24} 
        weight={700} 
        style={styles.name}
        autoTranslate={false}
      >
        {name}
      </Text>
      
      <Text 
        size={16} 
        color="grey70" 
        style={styles.email}
        autoTranslate={false}
      >
        {email}
      </Text>
      
      {onEditPress && (
        <TouchableOpacity style={styles.editButton} onPress={onEditPress} activeOpacity={0.7}>
          <Feather 
            name="edit-2" 
            size={16} 
            color={COLORS.light.grey70} 
          />
          <Text 
            size={14} 
            color="grey70" 
            weight={500}
            style={styles.editText}
            autoTranslate={false}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}