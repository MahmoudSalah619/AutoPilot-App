export interface DocumentItem {
  documentId: string;
  vehicleId: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  dateAdded: string;
  accessUrl: string;
}

export interface DocumentStatistics {
  totalDocuments: number;
  totalSize: number;
  recent: number;
  documentTypes: string[];
}

export interface DocumentResponse {
  data: DocumentItem[];
  statistics: DocumentStatistics;
}

export interface DocumentRequest {
  name: string;
  file: File | { uri: string; name: string; type: string };
}

export interface DocumentFilter {
  startDate?: string;
  endDate?: string;
  fileType?: string;
  search?: string;
}