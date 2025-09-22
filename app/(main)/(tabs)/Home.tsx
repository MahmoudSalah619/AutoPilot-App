import React from 'react';
import { View } from 'react-native';
import MainScreenWrapper from '@/components/templates/MainScreenWrapper';
import VehicleCardOrganism from '@/components/organisms/scoped/VehicleCard';
import LastGasConsumption from '@/components/organisms/scoped/LastGasConsumption';

const Home = () => {
  return (
    <MainScreenWrapper customStyle={{ paddingTop: 0, flex: 1 }}>
      <View>
        <VehicleCardOrganism />
      </View>
      <View>
        <LastGasConsumption />
      </View>
    </MainScreenWrapper>
  );
};

export default Home;
