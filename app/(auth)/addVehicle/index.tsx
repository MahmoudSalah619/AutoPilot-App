import { Button, Text } from '@/components/atoms';
import { FormInput } from '@/components/molecules/common';
import AuthScreenWrapper from '@/components/templates/AuthScreenWrapper';
import { useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import styles from './styles';
import { useAddVehicleMutation } from '@/apis/services/auth';
import { useRoute } from '@react-navigation/native';

export default function AddVehicle() {
  const router = useRouter();
  const route = useRoute();
  const params = route?.params?.res;
  const token = JSON.parse(params).access_token;
  console.log(token, 'token');
  const ttt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MmEwYzYxZC02NDdlLTRiZWQtOTE5Ni01YjZlNGU5NTRkZTEiLCJlbWFpbCI6InVzNDQ1ZXJAZXhhbXBsZS5jb20iLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNzU5MTY4Njc4LCJleHAiOjE3NTkyNTUwNzh9.GJWJM1-RhP5J6D1-BqyyKoEQ7skLbhHSIyf9MmZBPZM';

  const [addVehicle] = useAddVehicleMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({});
  const onSubmit = (data: any) => {
    console.log(data, 'daataaaaaaaaaaaaaaaaaaaaa');
    addVehicle({ data, token })
      .unwrap()
      .then((res) => {
        router.replace('/(main)/(tabs)/Home');
        console.log(res, 'add vehicle response');
      })
      .catch((err) => {
        console.error(err, 'add vehicle error');
      });
  };

  return (
    <AuthScreenWrapper justifyContent="space-between" isScrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Here we go!</Text>
        <Text style={styles.title}>Fill in your details</Text>
        <View style={styles.formContainer}>
          <FormInput
            label="Brand"
            name="make"
            placeholder="Brand"
            control={control}
            required
            rules={{
              required: 'Please Enter your brand',
            }}
            error={typeof errors.make?.message === 'string' ? errors.make.message : undefined}
          />
          <FormInput
            label="Model"
            name="model"
            placeholder="Model"
            control={control}
            required
            rules={{
              required: 'Please Enter your model',
            }}
            error={typeof errors.model?.message === 'string' ? errors.model.message : undefined}
          />
          <FormInput
            label="Year"
            name="year"
            placeholder="Select Year"
            control={control}
            required
            rules={{
              required: 'Please Enter your year',
            }}
            error={typeof errors.year?.message === 'string' ? errors.year.message : undefined}
          />
          <FormInput
            label="Kilometers"
            name="kilometers"
            placeholder="Kilometers"
            control={control}
            required
            rules={{
              required: 'Please Enter your kilometers',
            }}
            error={
              typeof errors.kilometers?.message === 'string' ? errors.kilometers.message : undefined
            }
          />
          <Button
            title={'Vroooom!'}
            onPress={handleSubmit(onSubmit)}
            // onPress={() => router.push('/(auth)/addVehicle')}
            // disabled={isLoading}
          />
        </View>
      </View>
    </AuthScreenWrapper>
  );
}
