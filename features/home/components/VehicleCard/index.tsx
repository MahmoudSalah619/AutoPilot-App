import { Button, SeperateLine, Text } from '@/shared/components/ui';
import { CardWrapper } from '@/shared/components/ui';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import styles from './styles';
import Feather from '@expo/vector-icons/Feather';
import { FormInput as ControllableInput } from '@/shared/components/ui';
import { useForm } from 'react-hook-form';
import GLOBAL_STYLES from '@/constants/GlobalStyles';
import { UpdateKiloModal } from '@/shared/components/layout';

export default function VehicleCardOrganism() {
  const [isEditing, setisEditing] = useState(false);
  const [isUpdateModalVisible, setisUpdateModalVisible] = useState(false);
  const { control } = useForm();

  const showUpdateModal = () => {
    setisUpdateModalVisible(true);
  };
  return (
    <CardWrapper customStyles={styles.container}>
      {isUpdateModalVisible && (
        <UpdateKiloModal
          isVisible={isUpdateModalVisible}
          setVisible={setisUpdateModalVisible}
          onSubmit={() => {}}
        />
      )}
      <View style={{ ...GLOBAL_STYLES.rowJustifyBetween }}>
        <View>
          <Text size={18} weight={800}>
            Your Vehicle
          </Text>
          <Text style={{ marginVertical: 8 }} size={14} color="grey70">
            View and edit your car's details.
          </Text>
        </View>
        <TouchableOpacity
          style={{ alignSelf: 'flex-start', padding: 8, paddingTop: 0 }}
          onPress={() => {
            setisEditing(!isEditing);
          }}
        >
          <Feather name="edit" size={28} color="#707070" />
        </TouchableOpacity>
      </View>
      <View style={{ ...GLOBAL_STYLES.gap8 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <ControllableInput
              control={control}
              name="brand"
              label="Brand"
              placeholder="Vehicle Brand"
              defaultValue="Toyota Camry"
              editable={isEditing}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ControllableInput
              control={control}
              name="model"
              label="Model"
              placeholder="Vehicle Model"
              defaultValue="Toyota Camry"
              editable={isEditing}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <ControllableInput
              control={control}
              name="year"
              label="Year"
              placeholder="Vehicle Year"
              defaultValue="2020"
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ControllableInput
              control={control}
              name="kilometers"
              label="Kilometers"
              placeholder="Vehicle Kilometers"
              defaultValue="10000 Km"
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>
        </View>
      </View>
      <SeperateLine />
      <View>
        {isEditing ? (
          <Button title="Save changes" variant="filled" onPress={() => {}} />
        ) : (
          <Button title="Update Kilometers" variant="filled" onPress={showUpdateModal} />
        )}
      </View>
    </CardWrapper>
  );
}
