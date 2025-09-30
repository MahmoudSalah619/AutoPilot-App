import api from '@/apis';
import { ReminderRequest, ReminderResponse, ReminderItem } from '@/apis/@types/reminder';
import { getVehicleId } from '@/utils/getVehicleId';

export const reminderApi = api.injectEndpoints({
  endpoints: (build) => ({
    getReminders: build.query<ReminderResponse, { startDate?: string; endDate?: string }>({
      query: (filters = {}) => {
        const vehicleId = getVehicleId();
        const params = new URLSearchParams();

        if (filters.startDate) {
          params.append('start_date', filters.startDate);
        }
        if (filters.endDate) {
          params.append('end_date', filters.endDate);
        }

        return {
          url: `/vehicles/${vehicleId}/reminders/${params.toString() ? `?${params.toString()}` : ''}`,
        };
      },
      providesTags: ['reminder'],
    }),

    addReminder: build.mutation<ReminderItem, ReminderRequest>({
      query: (body) => {
        const vehicleId = getVehicleId();
        return {
          url: `/vehicles/${vehicleId}/reminders/`,
          method: 'POST',
          body: body,
        };
      },
      invalidatesTags: ['reminder'],
    }),

    updateReminder: build.mutation<ReminderItem, ReminderRequest & { reminderId: string }>({
      query: ({ reminderId, ...body }) => {
        const vehicleId = getVehicleId();
        return {
          url: `/vehicles/${vehicleId}/reminders/${reminderId}/`,
          method: 'PUT',
          body: body,
        };
      },
      invalidatesTags: ['reminder'],
    }),

    deleteReminder: build.mutation<void, { reminderId: string }>({
      query: ({reminderId}) => {
        const vehicleId = getVehicleId();
        return {
          url: `/vehicles/${vehicleId}/reminders/${reminderId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['reminder'],
    }),

    completeReminder: build.mutation<ReminderItem, { reminderId: string }>({
      query: ({ reminderId }) => {
        const vehicleId = getVehicleId();
        return {
          url: `/vehicles/${vehicleId}/reminders/${reminderId}/complete`,
          method: 'PATCH',
        };
      },
      invalidatesTags: ['reminder'],
    }),
  }),
});

export const {
  useGetRemindersQuery,
  useAddReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
  useCompleteReminderMutation,
} = reminderApi;
