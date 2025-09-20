import { Link, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button, Text } from '@/components/atoms';
import MainScreenWrapper from '@/components/templates/MainScreenWrapper';
import VehicleCardOrganism from '@/components/organisms/scoped/VehicleCard';

const Home = () => {
  const router = useRouter();
  return (
    <MainScreenWrapper customStyle={{ paddingTop: 0, flex: 1 }}>
      <View>
        <VehicleCardOrganism />
      </View>
    </MainScreenWrapper>
  );
};

export default Home;
