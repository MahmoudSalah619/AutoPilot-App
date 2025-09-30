import api from '@/apis';
import { DocumentRequest, DocumentResponse, DocumentItem, DocumentFilter } from '@/apis/@types/document';
import { getVehicleId } from '@/utils/getVehicleId';

export const documentApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDocuments: build.query<DocumentResponse, DocumentFilter | void>({
      query: (filters) => {
        const vehicleId = getVehicleId();
        if (!vehicleId) {
          throw new Error('Vehicle ID not found. Please ensure you are logged in and have a vehicle.');
        }
        const params = new URLSearchParams();
        
        // Build query parameters for filtering
        if (filters?.startDate) {
          params.append('start_date', filters.startDate);
        }
        if (filters?.endDate) {
          params.append('end_date', filters.endDate);
        }
        if (filters?.fileType) {
          params.append('file_type', filters.fileType);
        }
        if (filters?.search) {
          params.append('search', filters.search);
        }

        const queryString = params.toString();
        const url = `/vehicles/${vehicleId}/documents/${queryString ? `?${queryString}` : ''}`;
        console.log('GET Documents URL:', url);
        return {
          url,
        };
      },
      providesTags: ['document'],
    }),

    addDocument: build.mutation<DocumentItem, DocumentRequest>({
      query: (body) => {
        const vehicleId = getVehicleId();
        if (!vehicleId) {
          throw new Error('Vehicle ID not found. Please ensure you are logged in and have a vehicle.');
        }
        
        console.log('Creating FormData with vehicleId:', vehicleId);
        console.log('File data:', body.file);
        
        const formData = new FormData();
        formData.append('name', body.name);
        
        // Handle both File and React Native file objects
        if (body.file instanceof File) {
          formData.append('file', body.file);
        } else {
          // React Native file format - try alternative approach
          try {
            // Method 1: Direct object (current approach)
            const fileObject = {
              uri: body.file.uri,
              type: body.file.type,
              name: body.file.name,
            };
            
            // Log the exact structure being sent
            console.log('File object structure:', JSON.stringify(fileObject, null, 2));
            
            formData.append('file', fileObject as any);
            console.log('File appended to FormData successfully');
          } catch (fileError) {
            console.error('Error appending file to FormData:', fileError);
            throw new Error('Failed to prepare file for upload');
          }
        }

        const url = `/vehicles/${vehicleId}/documents/`;
        console.log('Request URL:', url);
        console.log('FormData entries:');
        
        // Debug: Log all FormData entries
        try {
          // Note: This might not work in all React Native versions
          for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, typeof value === 'object' ? JSON.stringify(value) : value);
          }
        } catch (e) {
          console.log('Cannot iterate FormData entries');
        }

        return {
          url,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['document'],
    }),

    updateDocument: build.mutation<DocumentItem, { documentId: string; name: string; file?: File }>(
      {
        query: ({ documentId, name, file }) => {
          const vehicleId = getVehicleId();
          if (!vehicleId) {
            throw new Error('Vehicle ID not found. Please ensure you are logged in and have a vehicle.');
          }
          const formData = new FormData();
          formData.append('name', name);
          if (file) {
            formData.append('file', file);
          }

          return {
            url: `/vehicles/${vehicleId}/documents/${documentId}/`,
            method: 'PUT',
            body: formData,
          };
        },
        invalidatesTags: ['document'],
      }
    ),

    deleteDocument: build.mutation<void, { documentId: string }>({
      query: ({ documentId }) => {
        const vehicleId = getVehicleId();
        if (!vehicleId) {
          throw new Error('Vehicle ID not found. Please ensure you are logged in and have a vehicle.');
        }
        return {
          url: `/vehicles/${vehicleId}/documents/${documentId}/`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['document'],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useAddDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} = documentApi;
