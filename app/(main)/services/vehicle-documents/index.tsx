import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import Feather from '@expo/vector-icons/Feather';
import { Text, CardWrapper, Button } from '@/shared/components/ui';
import { ModalWrapper } from '@/shared/components/layout';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { DocumentItem, DocumentStatistics } from '@/apis/@types/document';
import { AddVehicleDocumentModal } from '@/features/services';
import {
  useGetDocumentsQuery,
  useDeleteDocumentMutation,
} from '@/apis/services/services/documents';

const VehicleDocuments = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<{ fileType?: string }>({});

  // API hooks
  const { data: documentsData, isLoading, error } = useGetDocumentsQuery(
    Object.keys(currentFilter).length > 0 ? currentFilter : undefined
  );
  const [deleteDocument] = useDeleteDocumentMutation();

  const documents = documentsData?.data || [];
  const stats = documentsData?.statistics || {
    totalDocuments: 0,
    totalSize: 0,
    recent: 0,
    uploads: 0,
    documentTypes: [],
  };

  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'grey70');
  const backgroundColor = useThemeColor({}, 'background');

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
    const extension = fileName?.split('.').pop()?.toLowerCase();
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
    const extension = fileName?.split('.').pop()?.toLowerCase();
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

  const handleApplyFilter = (filters: { fileType?: string }) => {
    const newFilter: { fileType?: string } = {};
    
    if (filters.fileType && filters.fileType !== 'all') {
      newFilter.fileType = filters.fileType;
    }
    
    setCurrentFilter(newFilter);
  };

  const getFilterDisplayText = () => {
    const { fileType } = currentFilter;
    if (fileType) {
      return `File Type: ${fileType.toUpperCase()}`;
    }
    return null;
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
          onPress: async () => {
            try {
              await deleteDocument({ documentId }).unwrap();
              Alert.alert('Success', 'Document deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const handleDownloadDocument = async (document: DocumentItem) => {
    try {
      // In a real app, you would implement actual file download/sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(document.fileUrl, {
          mimeType: document.mimeType,
          dialogTitle: `Share ${document.name}`,
        });
      } else {
        Alert.alert('Download', `Would download: ${document.fileName}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const renderDocument = ({ item }: { item: DocumentItem }) => (
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
                Uploaded: {formatDate(item.dateAdded)}
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
            onPress={() => handleDeleteDocument(item.documentId)}
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
              {stats.recent}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Recent Uploads
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text size={20} weight={700} autoTranslate={false}>
              {stats.documentTypes?.length}
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
      {/* Header */}
      <View style={styles.header}>
        <Text size={28} weight={800} style={styles.pageTitle} autoTranslate={false}>
          Vehicle Documents
        </Text>
        <Text size={16} color="grey70" style={styles.pageSubtitle} autoTranslate={false}>
          Organize and manage your vehicle documentation
        </Text>
      </View>

      {/* Filter Button */}
      <TouchableOpacity 
        style={styles.filterModalButton}
        onPress={() => setIsFilterModalVisible(true)}
      >
        <Feather name="filter" size={20} color={COLORS.light.primary} />
        <Text size={14} weight={500} style={{ color: COLORS.light.primary }} autoTranslate={false}>Filters</Text>
        {currentFilter.fileType && (
          <View style={styles.filterBadge} />
        )}
      </TouchableOpacity>

      {/* Filter Display Text */}
      {getFilterDisplayText() && (
        <View style={{ marginBottom: 16 }}>
          <Text size={12} color="grey70" autoTranslate={false}>
            Filtered: {getFilterDisplayText()}
          </Text>
        </View>
      )}
      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text size={16} autoTranslate={false}>
            Loading documents...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={COLORS.light.danger} />
          <Text size={16} weight={600} style={styles.errorTitle} autoTranslate={false}>
            Failed to load documents
          </Text>
          <Text size={14} color="grey70" style={styles.errorSubtitle} autoTranslate={false}>
            Please check your connection and try again
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              /* RTK Query will auto-retry */
            }}
          >
            <Text size={14} color="primary" autoTranslate={false}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : documents.length > 0 ? (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.documentId}
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
        onAdd={() => setShowAddModal(false)}
      />

      {/* Filter Modal - Inline Component */}
      {isFilterModalVisible && (
        <FilterDocumentsModalComponent
          isVisible={isFilterModalVisible}
          setVisible={setIsFilterModalVisible}
          filters={currentFilter}
          onApplyFilters={handleApplyFilter}
          availableFileTypes={stats.documentTypes}
        />
      )}
    </SafeAreaView>
  );
};

// Filter Documents Modal Component
interface FilterDocumentsModalProps {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  filters: { fileType?: string };
  onApplyFilters: (filters: { fileType?: string }) => void;
  availableFileTypes: string[];
}

const FilterDocumentsModalComponent: React.FC<FilterDocumentsModalProps> = ({
  isVisible,
  setVisible,
  filters,
  onApplyFilters,
  availableFileTypes,
}) => {
  const [selectedFileType, setSelectedFileType] = useState<string>(filters.fileType || 'all');

  React.useEffect(() => {
    if (isVisible) {
      setSelectedFileType(filters.fileType || 'all');
    }
  }, [isVisible, filters.fileType]);

  const handleApplyFilters = () => {
    const newFilters = {
      fileType: selectedFileType === 'all' ? undefined : selectedFileType,
    };
    onApplyFilters(newFilters);
    setVisible(false);
  };

  const handleResetFilters = () => {
    setSelectedFileType('all');
    onApplyFilters({});
    setVisible(false);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const fileTypeOptions = ['all', ...availableFileTypes];

  return (
    <ModalWrapper
      isVisible={isVisible}
      setVisible={setVisible}
      height="auto"
      containerStyle={{
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 20,
      }}
    >
      <View style={{ gap: 20 }}>
        <Text size={20} weight={700} autoTranslate={false}>
          Filter Documents
        </Text>

        <View style={{ gap: 12 }}>
          <Text size={16} weight={600} autoTranslate={false}>
            File Type
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: 8 
          }}>
            {fileTypeOptions.map((fileType) => {
              const isSelected = selectedFileType === fileType;
              return (
                <TouchableOpacity
                  key={fileType}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: COLORS.light.primary,
                    backgroundColor: isSelected ? COLORS.light.primary : 'transparent',
                  }}
                  onPress={() => setSelectedFileType(fileType)}
                >
                  <Text
                    size={14}
                    color={isSelected ? "white" : "primary"}
                    autoTranslate={false}
                  >
                    {fileType === 'all' ? 'All Files' : fileType.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Button title="Apply Filter" onPress={handleApplyFilters} />
          <Button title="Reset Filter" variant="outlined" onPress={handleResetFilters} />
          <Button title="Cancel" variant="outlined" onPress={handleClose} />
        </View>
      </View>
    </ModalWrapper>
  );
};

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    gap: 4,
    marginBottom: 20,
  },
  pageTitle: {
    // Spacing handled by header gap
  },
  pageSubtitle: {
    lineHeight: 22,
  },
  listContainer: {
    paddingBottom: 100, // Space for floating button
  },
  filterModalButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    gap: 8,
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.light.primary,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 20,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  errorSubtitle: {
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
};

export default VehicleDocuments;
