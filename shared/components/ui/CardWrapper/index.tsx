import React from 'react';
import { View, ViewStyle } from 'react-native';
import getShadowStyle from '@/utils/getShadowStyle';

interface CardWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  customStyles?: ViewStyle | ViewStyle[];
  withShadow?: boolean;
  borderRadius?: number;
  padding?: number;
}

const CardWrapper: React.FC<CardWrapperProps> = ({
  children,
  style,
  customStyles,
  withShadow = true,
  borderRadius = 12,
  padding = 16,
  ...props
}) => {
  const cardStyles: ViewStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius,
    padding,
    ...(withShadow && getShadowStyle({ opacity: 0.1 })),
  };

  const combinedStyles = [
    cardStyles,
    customStyles,
    style,
  ].filter(Boolean);

  return (
    <View style={combinedStyles} {...props}>
      {children}
    </View>
  );
};

export default CardWrapper;