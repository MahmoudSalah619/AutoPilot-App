import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View } from 'react-native';
import ModalWrapper from '../modalWrapper';
import GLOBAL_STYLES from '@/constants/GlobalStyles';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import { Input } from '@/components/atoms';
import SelectDropdown from 'react-native-select-dropdown';

export default function AddMaintenanceModal({
  isVisible,
  setVisible,
  onSubmit,
}: {
  isVisible: boolean;
  setVisible: (value: boolean) => void;
  onSubmit: (data: {
    maintenanceType: string;
    date: string;
    kilometer: string;
    cost: string;
    interval: string;
    notes: string;
  }) => void;
}) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      maintenanceType: 'oil change',
      date: '',
      kilometer: '',
      cost: '',
      interval: '',
      notes: '',
    },
  });
  const handleClose = () => {
    setVisible(false);
  };
  const maintenanceTypes = ['oil change', 'brake inspection', 'tire rotation', 'fluid check'];

  return (
    <ModalWrapper isVisible={isVisible} setVisible={setVisible}>
      <View>
        <View style={[GLOBAL_STYLES.vhCentering, GLOBAL_STYLES.gap16]}>
          <Text color="black" size={18} weight={700}>
            زبي زبي يابنتالمتناكه
          </Text>
          <Text color="grey70" size={14}>
            Add a new maintenance record to your vehicle's history.
          </Text>
          <View style={{ width: '100%', marginBottom: 16 }}>
            <Text weight={600} size={16} style={{ marginBottom: 8 }}>
              Service Type
            </Text>
            <Controller
              control={control}
              name="maintenanceType"
              render={({ field: { onChange, value } }) => (
                <SelectDropdown
                  data={maintenanceTypes}
                  onSelect={onChange}
                  renderButton={() => (
                    <View
                      style={{ padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 }}
                    >
                      <Text>{value || 'Select country'}</Text>
                    </View>
                  )}
                  renderItem={(item: string) => (
                    <View style={{ padding: 12 }}>
                      <Text>{item}</Text>
                    </View>
                  )}
                />
              )}
            />
          </View>
          <View
            style={{
              width: '100%',
              marginBottom: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center',
              gap: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text weight={600} size={16} style={{ marginBottom: 8 }}>
                Date
              </Text>
              <Controller
                control={control}
                name="date"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="e.g., 2023-01-01"
                    keyboardType="default"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text weight={600} size={16} style={{ marginBottom: 8 }}>
                Kilometer Reading
              </Text>
              <Controller
                control={control}
                name="kilometer"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="e.g., 15000"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>
          <View
            style={{
              width: '100%',
              marginBottom: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center',
              gap: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text weight={600} size={16} style={{ marginBottom: 8 }}>
                Cost
              </Text>
              <Controller
                control={control}
                name="cost"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="e.g., 100.00"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text weight={600} size={16} style={{ marginBottom: 8 }}>
                Service Interval (km)
              </Text>
              <Controller
                control={control}
                name="interval"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="e.g., 15000"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>
          <View
            style={{
              width: '100%',
              marginBottom: 16,
            }}
          >
            <View>
              <Text weight={600} size={16} style={{ marginBottom: 8 }}>
                Notes
              </Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Notes"
                    isTextAreaInput
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>
        </View>
        <View style={[GLOBAL_STYLES.rowJustifyBetween, GLOBAL_STYLES.gap8, { marginTop: 16 }]}>
          <Button title="Confirm" isFullWidth onPress={handleSubmit(onSubmit)} />
          <Button title="Cancel" isFullWidth variant="outlined" onPress={handleClose} />
        </View>
      </View>
    </ModalWrapper>
  );
}
