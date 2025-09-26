export interface DocumentItem {
  document_id: string;
  vehicle_id: string;
  name: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  date_added: string;
}

export interface DocumentResponse {
  documents: DocumentItem[];
}

export interface DocumentRequest {
  name: string;
  file: File;
}