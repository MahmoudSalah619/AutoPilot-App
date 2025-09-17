import { Button, Text } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import React, { useState } from 'react';
import { View } from 'react-native';
import styles from './styles';
import VehicleItemCard from '@/components/molecules/scoped/VehicleItemCard';

export default function VehicleCardOrganism() {
  const [Disbled, setDisbled] = useState(true);
  return (
    <CardWrapper customStyles={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text size={22} weight={800}>
            Your Vehicle
          </Text>
          <Text style={{ marginVertical: 8 }} size={18}>
            View and edit your car's details.
          </Text>
        </View>
        <View>
          <Button
            title={Disbled ? 'Edit' : 'Save'}
            variant="underlined"
            onPress={() => {
              setDisbled(!Disbled);
            }}
          />
        </View>
      </View>

      <View style={{ marginTop: 10, flexDirection: 'row', gap: 15 }}>
        <VehicleItemCard
          placeHolder="Vehicle Brand"
          onChange={(value) => console.log(value)}
          defaultValue="Toyota Camry"
          disabled={Disbled}
        />
        <VehicleItemCard
          placeHolder="Vehicle Model"
          onChange={(value) => console.log(value)}
          defaultValue="Toyota Camry"
          disabled={Disbled}
        />
      </View>
      <View style={{ marginTop: 10, flexDirection: 'row', gap: 15 }}>
        <VehicleItemCard
          placeHolder="Vehicle Year"
          onChange={(value) => console.log(value)}
          defaultValue="2020"
          disabled={Disbled}
        />
        <VehicleItemCard
          placeHolder="Vehicle Kilometers"
          onChange={(value) => console.log(value)}
          defaultValue="10000 Km"
          disabled={Disbled}
        />
      </View>
      <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 20 }}>
        <Button title="Update Kilometers" variant="filled" onPress={() => {}} />
      </View>
    </CardWrapper>
  );
}
