import api from '@/apis';
import { ReminderRequest, ReminderResponse, ReminderItem } from '@/apis/@types/reminder';

export const reminderApi = api.injectEndpoints({
  endpoints: (build) => ({
    getReminders: build.query<ReminderResponse, void>({
      query: () => ({
        url: `/vehicles/${147}/reminders/`,
      }),
      providesTags: ['reminder'],
    }),

    addReminder: build.mutation<ReminderItem, ReminderRequest>({
      query: (body) => ({
        url: `/vehicles/${147}/reminders/`,
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['reminder'],
    }),

    updateReminder: build.mutation<ReminderItem, ReminderRequest & { reminderId: string }>({
      query: ({ reminderId, ...body }) => ({
        url: `/vehicles/${147}/reminders/${reminderId}/`,
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: ['reminder'],
    }),

    deleteReminder: build.mutation<void, { reminderId: string }>({
      query: ({ reminderId }) => ({
        url: `/vehicles/${147}/reminders/${reminderId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['reminder'],
    }),
  }),
});

export const {
  useGetRemindersQuery,
  useAddReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} = reminderApi;
