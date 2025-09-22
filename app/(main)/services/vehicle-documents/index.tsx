import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { VehicleDocumentEntry, VehicleDocumentStats } from '@/@types/vehicleDocuments';
import AddVehicleDocumentModal from '@/components/organisms/scoped/services/AddVehicleDocumentModal';

// Sample data for demonstration
const sampleDocuments: VehicleDocumentEntry[] = [
  {
    id: '1',
    name: 'Vehicle Registration',
    fileName: 'vehicle_registration.pdf',
    fileUri: 'file://documents/vehicle_registration.pdf',
    fileSize: 245760,
    fileType: 'application/pdf',
    uploadDate: '2025-09-20T10:30:00.000Z',
  },
  {
    id: '2',
    name: 'Insurance Certificate',
    fileName: 'insurance_2025.pdf',
    fileUri: 'file://documents/insurance_2025.pdf',
    fileSize: 456789,
    fileType: 'application/pdf',
    uploadDate: '2025-09-15T14:20:00.000Z',
  },
  {
    id: '3',
    name: 'Driver License',
    fileName: 'license_scan.jpg',
    fileUri: 'file://documents/license_scan.jpg',
    fileSize: 1024000,
    fileType: 'image/jpeg',
    uploadDate: '2025-09-10T09:45:00.000Z',
  },
];

const VehicleDocuments = () => {
  const [documents, setDocuments] = useState<VehicleDocumentEntry[]>(sampleDocuments);
  const [showAddModal, setShowAddModal] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'grey70');
  const backgroundColor = useThemeColor({}, 'background');

  // Calculate statistics
  const calculateStats = (): VehicleDocumentStats => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const documentTypes = [...new Set(documents.map(doc => doc.fileType))];
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUploads = documents.filter(doc => new Date(doc.uploadDate) > oneWeekAgo).length;

    return {
      totalDocuments: documents.length,
      totalSize,
      recentUploads,
      documentTypes,
    };
  };

  const stats = calculateStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const getFileIconColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return COLORS.light.danger;
      case 'doc':
      case 'docx':
        return COLORS.light.primary;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return COLORS.light.success;
      default:
        return COLORS.light.grey70;
    }
  };

  const handleAddDocument = () => {
    setShowAddModal(true);
  };

  const handleAddDocumentEntry = (newDocument: VehicleDocumentEntry) => {
    setDocuments((prevDocs) => [newDocument, ...prevDocs]);
  };

  const handleDeleteDocument = (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentId));
          },
        },
      ]
    );
  };

  const handleDownloadDocument = async (document: VehicleDocumentEntry) => {
    try {
      // In a real app, you would implement actual file download/sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(document.fileUri, {
          mimeType: document.fileType,
          dialogTitle: `Share ${document.name}`,
        });
      } else {
        Alert.alert('Download', `Would download: ${document.fileName}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const renderDocument = ({ item }: { item: VehicleDocumentEntry }) => (
    <CardWrapper customStyles={styles.documentCard}>
      <View style={styles.documentContainer}>
        <View style={styles.documentHeader}>
          <View style={styles.documentInfo}>
            <View style={styles.fileIconContainer}>
              <Feather 
                name={getFileIcon(item.fileName)} 
                size={24} 
                color={getFileIconColor(item.fileName)} 
              />
            </View>
            <View style={styles.documentDetails}>
              <Text size={16} weight={600} autoTranslate={false}>
                {item.name}
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                {item.fileName} • {formatFileSize(item.fileSize)}
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                Uploaded: {formatDate(item.uploadDate)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.documentActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDownloadDocument(item)}
          >
            <Feather name="download" size={16} color={COLORS.light.primary} />
            <Text size={12} color="primary" style={styles.actionText} autoTranslate={false}>
              Download
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteActionButton]}
            onPress={() => handleDeleteDocument(item.id)}
          >
            <Feather name="trash-2" size={16} color={COLORS.light.danger} />
            <Text size={12} color="danger" style={styles.actionText} autoTranslate={false}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CardWrapper>
  );

  const renderStatsCard = () => (
    <CardWrapper customStyles={styles.statsCard}>
      <View style={styles.statsContainer}>
        <Text size={18} weight={700} style={styles.statsTitle} autoTranslate={false}>
          Document Statistics
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text size={20} weight={700} color="primary" autoTranslate={false}>
              {stats.totalDocuments}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Total Documents
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text size={20} weight={700} autoTranslate={false}>
              {formatFileSize(stats.totalSize)}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Total Size
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text size={20} weight={700} autoTranslate={false}>
              {stats.recentUploads}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Recent Uploads
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text size={20} weight={700} autoTranslate={false}>
              {stats.documentTypes.length}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              File Types
            </Text>
          </View>
        </View>
      </View>
    </CardWrapper>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Feather name="file-text" size={64} color={mutedColor} />
      <Text size={18} weight={600} style={styles.emptyStateTitle} autoTranslate={false}>
        No documents yet
      </Text>
      <Text size={14} color="grey70" style={styles.emptyStateSubtitle} autoTranslate={false}>
        Start organizing your vehicle documents by adding your first file
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Content */}
      {documents.length > 0 ? (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={renderDocument}
          ListHeaderComponent={renderStatsCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddDocument}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Document Modal */}
      <AddVehicleDocumentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddDocumentEntry}
      />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 100, // Space for floating button
  },
  statsCard: {
    marginBottom: 16,
    padding: 20,
  },
  statsContainer: {
    alignItems: 'center' as const,
  },
  statsTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    width: '100%' as const,
  },
  statItem: {
    alignItems: 'center' as const,
    width: '48%' as const,
    marginBottom: 16,
  },
  documentCard: {
    marginBottom: 12,
    padding: 16,
  },
  documentContainer: {
    gap: 12,
  },
  documentHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  documentInfo: {
    flexDirection: 'row' as const,
    flex: 1,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  documentDetails: {
    flex: 1,
    gap: 2,
  },
  documentActions: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  deleteActionButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionText: {
    marginLeft: 4,
  },
  addButton: {
    position: 'absolute' as const,
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.light.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptyStateSubtitle: {
    textAlign: 'center' as const,
    lineHeight: 20,
  },
};

export default VehicleDocuments;
