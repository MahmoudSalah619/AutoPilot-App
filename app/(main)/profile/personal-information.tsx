import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/apis/autopilotApi';
import { Screen } from '@/shared/components/layout';
import {
  Avatar,
  Button,
  Card,
  DateField,
  FormInput,
  IconButton,
  SectionHeader,
  SkeletonCard,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { EMAIL_RULES } from '@/features/auth/validation';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

export default function PersonalInformation() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const { control, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
    },
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone ?? '',
      dateOfBirth: profile.dateOfBirth ?? '',
      address: profile.address ?? '',
    });
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        address: values.address.trim() || undefined,
      }).unwrap();

      toast.success(t('profile.personal.saved'));
      setIsEditing(false);
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.saveFailed';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);

    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone ?? '',
        dateOfBirth: profile.dateOfBirth ?? '',
        address: profile.address ?? '',
      });
    }
  };

  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';

  return (
    <Screen
      scroll
      gap="xl"
      header={{
        titleTx: 'profile.personal.title',
        right: isEditing ? undefined : (
          <IconButton
            icon="edit-2"
            variant="soft"
            color="primary"
            backgroundColor="primarySoft"
            onPress={() => setIsEditing(true)}
            accessibilityLabel={t('common.edit')}
          />
        ),
      }}
      footer={
        isEditing ? (
          <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
            <Button
              variant="outline"
              tx="common.cancel"
              onPress={handleCancel}
              style={{ flex: 1 }}
            />
            <Button
              tx="common.saveChanges"
              loading={isSaving}
              onPress={handleSubmit(onSubmit)}
              style={{ flex: 1.4 }}
            />
          </View>
        ) : undefined
      }
    >
      {isLoading ? (
        <SkeletonCard count={2} />
      ) : (
        <>
          <Card padding="xl" style={{ alignItems: 'center', rowGap: SPACING.md }}>
            <Avatar name={fullName} uri={profile?.avatarUrl} size={80} />
          </Card>

          <View style={{ rowGap: SPACING.md }}>
            <SectionHeader titleTx="profile.personal.basicInfo" icon="user" />

            <Card style={{ rowGap: SPACING.lg }}>
              <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
                <FormInput
                  control={control}
                  name="firstName"
                  labelTx="auth.firstName"
                  editable={isEditing}
                  autoCapitalize="words"
                  required
                  containerStyle={{ flex: 1 }}
                />
                <FormInput
                  control={control}
                  name="lastName"
                  labelTx="auth.lastName"
                  editable={isEditing}
                  autoCapitalize="words"
                  required
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field: { onChange, value } }) => (
                  <DateField
                    labelTx="profile.personal.dateOfBirth"
                    value={value}
                    onChange={onChange}
                    disabled={!isEditing}
                    maxDate={new Date().toISOString()}
                    clearable={isEditing}
                  />
                )}
              />
            </Card>
          </View>

          <View style={{ rowGap: SPACING.md }}>
            <SectionHeader titleTx="profile.personal.contactInfo" icon="mail" />

            <Card style={{ rowGap: SPACING.lg }}>
              <FormInput
                control={control}
                name="email"
                labelTx="auth.email"
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                required
                rules={EMAIL_RULES}
              />

              <FormInput
                control={control}
                name="phone"
                labelTx="profile.personal.phone"
                editable={isEditing}
                keyboardType="phone-pad"
              />

              <FormInput
                control={control}
                name="address"
                labelTx="profile.personal.address"
                editable={isEditing}
                multilineBox
              />
            </Card>
          </View>
        </>
      )}
    </Screen>
  );
}
