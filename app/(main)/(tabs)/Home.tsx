import React from 'react';
import { View } from 'react-native';
import { MainScreenWrapper } from '@/shared/components/layout';
import { VehicleCard, LastGasConsumption } from '@/features/home';

const Home = () => {
  return (
    <MainScreenWrapper customStyle={{ paddingTop: 0, flex: 1 }}>
      <View>
        <VehicleCard />
      </View>
      <View>
        <LastGasConsumption />
      </View>
    </MainScreenWrapper>
  );
};

export default Home;
