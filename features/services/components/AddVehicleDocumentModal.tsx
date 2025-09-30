import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { useForm } from 'react-hook-form';
import * as DocumentPicker from 'expo-document-picker';
import Feather from '@expo/vector-icons/Feather';
import { Text, Button } from '@/shared/components/ui';
import { FormInput as ControllableInput } from '@/shared/components/ui';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AddDocumentFormData, VehicleDocumentEntry } from '@/@types/vehicleDocuments';

interface AddVehicleDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: VehicleDocumentEntry) => void;
}

const AddVehicleDocumentModal: React.FC<AddVehicleDocumentModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddDocumentFormData>({
    defaultValues: {
      name: '',
      file: undefined,
    },
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Watch form values
  const watchedValues = watch();

  const onSubmit = (data: AddDocumentFormData) => {
    if (!data.file) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }

    const newEntry: VehicleDocumentEntry = {
      id: Date.now().toString(),
      name: data.name,
      fileName: data.file.name,
      fileUri: data.file.uri,
      fileSize: data.file.size,
      fileType: data.file.type || 'application/octet-stream',
      uploadDate: new Date().toISOString(),
    };

    onAdd(newEntry);
    handleClose();
  };

  const handleClose = () => {
    reset({
      name: '',
      file: undefined,
    });
    onClose();
  };

  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setValue('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
          size: file.size || 0,
        });
        
        // Auto-fill name if empty
        if (!watchedValues.name) {
          const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
          setValue('name', nameWithoutExtension);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'file-text';
      case 'doc':
      case 'docx':
        return 'file-text';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'file';
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      backdropOpacity={0.5}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriverForBackdrop
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color={textColor} />
          </TouchableOpacity>
          <Text size={18} weight={700} style={styles.headerTitle} autoTranslate={false}>
            Add Document
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.formCard}>
            {/* Document Name Input */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Document Name
              </Text>
              <ControllableInput
                control={control as any}
                name="name"
                placeholder="e.g., Vehicle Registration, Insurance"
                keyboardType="default"
                rules={{
                  required: 'Document name is required',
                }}
              />
            </View>

            {/* File Upload Section */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Document File
              </Text>
              
              <TouchableOpacity style={styles.filePickerButton} onPress={handleFilePicker}>
                <Feather name="upload" size={20} color={COLORS.light.primary} />
                <Text size={14} color="primary" style={styles.filePickerText} autoTranslate={false}>
                  Choose File
                </Text>
              </TouchableOpacity>

              {/* Selected File Preview */}
              {watchedValues.file && (
                <View style={styles.selectedFileContainer}>
                  <View style={styles.fileInfo}>
                    <Feather 
                      name={getFileIcon(watchedValues.file.name)} 
                      size={20} 
                      color={COLORS.light.primary} 
                    />
                    <View style={styles.fileDetails}>
                      <Text size={14} weight={600} autoTranslate={false}>
                        {watchedValues.file.name}
                      </Text>
                      <Text size={12} color="grey70" autoTranslate={false}>
                        {formatFileSize(watchedValues.file.size)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setValue('file', undefined)}
                    style={styles.removeFileButton}
                  >
                    <Feather name="x" size={16} color={COLORS.light.danger} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <Button title="Cancel" variant="outlined" onPress={handleClose} isFullWidth />
          <View style={styles.buttonSpacer} />
          <Button title="Add Document" variant="filled" onPress={handleSubmit(onSubmit)} isFullWidth />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.greyF5,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 16,
  },
  formCard: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  inputGroup: {
    gap: 8,
    marginBottom: 20,
  },
  label: {},
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.light.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  filePickerText: {
    marginLeft: 8,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.light.greyF5,
    borderRadius: 8,
    marginTop: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  removeFileButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.greyF5,
  },
  buttonSpacer: {
    width: 12,
  },
});

export default AddVehicleDocumentModal;