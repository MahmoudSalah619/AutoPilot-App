import React from 'react';
import { useColorScheme } from 'react-native';
import NovaBlack from '@/assets/images/auto-pilot.png';
import NovaWhite from '@/assets/images/auto-pilot.png';
import Image from '../Image';

export default function Logo({ width = 100, height = 100 }) {
  const colorScheme = useColorScheme() ?? 'light';
  const themedLogo = colorScheme === 'light' ? NovaBlack : NovaWhite;
  return (
    <Image source={themedLogo} style={{ alignSelf: 'center', width: width, height: height }} />
  );
}
