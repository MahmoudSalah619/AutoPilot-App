export interface VehicleDocumentEntry {
  id: string;
  name: string;
  fileName: string;
  fileUri: string;
  fileSize: number;
  uploadDate: string;
  fileType: string;
}

export interface AddDocumentFormData {
  name: string;
  file?: {
    uri: string;
    name: string;
    type: string;
    size: number;
  };
}

export interface VehicleDocumentStats {
  totalDocuments: number;
  totalSize: number;
  recentUploads: number;
  documentTypes: string[];
}