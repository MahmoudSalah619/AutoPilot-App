import api from '@/apis';
import { DocumentRequest, DocumentResponse, DocumentItem } from '@/apis/@types/document';

export const documentApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDocuments: build.query<DocumentResponse, void>({
      query: () => ({
        url: `/vehicles/${147}/documents/`,
      }),
      providesTags: ['document'],
    }),

    addDocument: build.mutation<DocumentItem, DocumentRequest>({
      query: (body) => {
        const formData = new FormData();
        formData.append('name', body.name);
        formData.append('file', body.file);
        
        return {
          url: `/vehicles/${147}/documents/`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['document'],
    }),

    updateDocument: build.mutation<DocumentItem, { documentId: string; name: string; file?: File }>({
      query: ({ documentId, name, file }) => {
        const formData = new FormData();
        formData.append('name', name);
        if (file) {
          formData.append('file', file);
        }
        
        return {
          url: `/vehicles/${147}/documents/${documentId}/`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['document'],
    }),

    deleteDocument: build.mutation<void, { documentId: string }>({
      query: ({ documentId }) => ({
        url: `/vehicles/${147}/documents/${documentId}/`,
        method: 'DELETE',
      }),
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