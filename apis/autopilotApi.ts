/**
 * The app's single data API.
 *
 * Every endpoint delegates to a repository, which decides between the mock
 * store and Supabase. That means cache keys, tags, loading flags and
 * invalidation are already correct today, and switching to the real backend
 * changes nothing in this file.
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import type {
  AppNotification,
  ClimateRecord,
  DiagnosticCode,
  FuelEntry,
  MaintenanceRecord,
  ServiceReminder,
  Trip,
  UserPreferences,
  UserProfile,
  Vehicle,
  VehicleDocument,
} from '@/@types/models';

import * as account from './repositories/account';
import * as climate from './repositories/climate';
import * as diagnostics from './repositories/diagnostics';
import * as documents from './repositories/documents';
import * as fuel from './repositories/fuel';
import * as maintenance from './repositories/maintenance';
import * as reminders from './repositories/reminders';
import * as trips from './repositories/trips';
import * as vehicles from './repositories/vehicles';
import { RepositoryError } from './repositories/helpers';

export interface ApiError {
  status: number;
  /** Translation key or message, suitable for showing to the user. */
  message: string;
}

/**
 * Normalizes anything a repository throws into a shape the UI can render.
 * Repositories throw translation keys for validation failures, so a caught
 * error is safe to pass straight to `t()`.
 */
function toApiError(error: unknown): { error: ApiError } {
  if (error instanceof RepositoryError) {
    return { error: { status: error.status, message: error.message } };
  }

  if (error instanceof Error) {
    return { error: { status: 500, message: error.message } };
  }

  return { error: { status: 500, message: 'errors.unexpected' } };
}

/** Wraps a repository call in the queryFn result shape. */
async function run<T>(operation: () => Promise<T>) {
  try {
    return { data: await operation() };
  } catch (error) {
    return toApiError(error);
  }
}

export const autopilotApi = createApi({
  reducerPath: 'autopilotApi',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: [
    'Vehicle',
    'Maintenance',
    'Reminder',
    'Fuel',
    'Document',
    'Climate',
    'Trip',
    'Profile',
    'Preferences',
    'Notification',
    'Diagnostic',
  ],
  endpoints: (build) => ({
    /* ── Auth ─────────────────────────────────────────────────────────── */

    signIn: build.mutation<account.Session, account.Credentials>({
      queryFn: (credentials) => run(() => account.signIn(credentials)),
      invalidatesTags: ['Profile', 'Vehicle'],
    }),

    signUp: build.mutation<account.Session, account.SignUpPayload>({
      queryFn: (payload) => run(() => account.signUp(payload)),
      invalidatesTags: ['Profile'],
    }),

    signOut: build.mutation<void, void>({
      queryFn: () => run(() => account.signOut()),
    }),

    requestPasswordReset: build.mutation<void, string>({
      queryFn: (email) => run(() => account.requestPasswordReset(email)),
    }),

    /* ── Profile & preferences ────────────────────────────────────────── */

    getProfile: build.query<UserProfile, void>({
      queryFn: () => run(() => account.getProfile()),
      providesTags: ['Profile'],
    }),

    updateProfile: build.mutation<UserProfile, Partial<UserProfile>>({
      queryFn: (patch) => run(() => account.updateProfile(patch)),
      invalidatesTags: ['Profile'],
    }),

    getPreferences: build.query<UserPreferences, void>({
      queryFn: () => run(() => account.getPreferences()),
      providesTags: ['Preferences'],
    }),

    updatePreferences: build.mutation<UserPreferences, Partial<UserPreferences>>({
      queryFn: (patch) => run(() => account.updatePreferences(patch)),
      invalidatesTags: ['Preferences'],
    }),

    /* ── Vehicles ─────────────────────────────────────────────────────── */

    getVehicles: build.query<Vehicle[], void>({
      queryFn: () => run(() => vehicles.listVehicles()),
      providesTags: (result) => [
        'Vehicle',
        ...(result ?? []).map((vehicle) => ({ type: 'Vehicle' as const, id: vehicle.id })),
      ],
    }),

    getVehicle: build.query<Vehicle, string>({
      queryFn: (id) => run(() => vehicles.getVehicle(id)),
      providesTags: (_result, _error, id) => [{ type: 'Vehicle', id }],
    }),

    createVehicle: build.mutation<Vehicle, vehicles.VehicleDraft>({
      queryFn: (draft) => run(() => vehicles.createVehicle(draft)),
      invalidatesTags: ['Vehicle'],
    }),

    updateVehicle: build.mutation<Vehicle, { id: string; patch: Partial<vehicles.VehicleDraft> }>({
      queryFn: ({ id, patch }) => run(() => vehicles.updateVehicle(id, patch)),
      invalidatesTags: ['Vehicle'],
    }),

    updateOdometer: build.mutation<Vehicle, { id: string; odometer: number }>({
      queryFn: ({ id, odometer }) => run(() => vehicles.updateOdometer(id, odometer)),
      // Reminders and maintenance are distance-triggered, so they re-resolve too.
      invalidatesTags: ['Vehicle', 'Reminder', 'Maintenance'],
    }),

    deleteVehicle: build.mutation<string, string>({
      queryFn: (id) => run(() => vehicles.deleteVehicle(id)),
      invalidatesTags: ['Vehicle', 'Maintenance', 'Reminder', 'Fuel', 'Document'],
    }),

    /* ── Maintenance ──────────────────────────────────────────────────── */

    getMaintenance: build.query<MaintenanceRecord[], maintenance.MaintenanceFilter | void>({
      queryFn: (filter) => run(() => maintenance.listMaintenance(filter ?? undefined)),
      providesTags: ['Maintenance'],
    }),

    getMaintenanceRecord: build.query<MaintenanceRecord, string>({
      queryFn: (id) => run(() => maintenance.getMaintenanceRecord(id)),
      providesTags: (_result, _error, id) => [{ type: 'Maintenance', id }],
    }),

    createMaintenance: build.mutation<MaintenanceRecord, maintenance.MaintenanceDraft>({
      queryFn: (draft) => run(() => maintenance.createMaintenance(draft)),
      invalidatesTags: ['Maintenance', 'Notification'],
    }),

    updateMaintenance: build.mutation<
      MaintenanceRecord,
      { id: string; patch: Partial<maintenance.MaintenanceDraft> }
    >({
      queryFn: ({ id, patch }) => run(() => maintenance.updateMaintenance(id, patch)),
      invalidatesTags: ['Maintenance'],
    }),

    deleteMaintenance: build.mutation<string, string>({
      queryFn: (id) => run(() => maintenance.deleteMaintenance(id)),
      invalidatesTags: ['Maintenance'],
    }),

    /* ── Reminders ────────────────────────────────────────────────────── */

    getReminders: build.query<ServiceReminder[], reminders.ReminderFilter | void>({
      queryFn: (filter) => run(() => reminders.listReminders(filter ?? undefined)),
      providesTags: ['Reminder'],
    }),

    createReminder: build.mutation<ServiceReminder, reminders.ReminderDraft>({
      queryFn: (draft) => run(() => reminders.createReminder(draft)),
      invalidatesTags: ['Reminder'],
    }),

    updateReminder: build.mutation<
      ServiceReminder,
      { id: string; patch: Partial<reminders.ReminderDraft> }
    >({
      queryFn: ({ id, patch }) => run(() => reminders.updateReminder(id, patch)),
      invalidatesTags: ['Reminder'],
    }),

    completeReminder: build.mutation<ServiceReminder, string>({
      queryFn: (id) => run(() => reminders.completeReminder(id)),
      invalidatesTags: ['Reminder', 'Maintenance'],
    }),

    deleteReminder: build.mutation<string, string>({
      queryFn: (id) => run(() => reminders.deleteReminder(id)),
      invalidatesTags: ['Reminder'],
    }),

    /* ── Fuel ─────────────────────────────────────────────────────────── */

    getFuelEntries: build.query<fuel.FuelListResult, fuel.FuelFilter | void>({
      queryFn: (filter) => run(() => fuel.listFuelEntries(filter ?? undefined)),
      providesTags: ['Fuel'],
    }),

    createFuelEntry: build.mutation<FuelEntry, fuel.FuelEntryDraft>({
      queryFn: (draft) => run(() => fuel.createFuelEntry(draft)),
      invalidatesTags: ['Fuel', 'Vehicle'],
    }),

    updateFuelEntry: build.mutation<FuelEntry, { id: string; patch: Partial<fuel.FuelEntryDraft> }>(
      {
        queryFn: ({ id, patch }) => run(() => fuel.updateFuelEntry(id, patch)),
        invalidatesTags: ['Fuel'],
      }
    ),

    deleteFuelEntry: build.mutation<string, string>({
      queryFn: (id) => run(() => fuel.deleteFuelEntry(id)),
      invalidatesTags: ['Fuel'],
    }),

    /* ── Documents ────────────────────────────────────────────────────── */

    getDocuments: build.query<VehicleDocument[], documents.DocumentFilter | void>({
      queryFn: (filter) => run(() => documents.listDocuments(filter ?? undefined)),
      providesTags: ['Document'],
    }),

    createDocument: build.mutation<VehicleDocument, documents.DocumentDraft>({
      queryFn: (draft) => run(() => documents.createDocument(draft)),
      invalidatesTags: ['Document', 'Notification'],
    }),

    updateDocument: build.mutation<
      VehicleDocument,
      { id: string; patch: Partial<documents.DocumentDraft> }
    >({
      queryFn: ({ id, patch }) => run(() => documents.updateDocument(id, patch)),
      invalidatesTags: ['Document'],
    }),

    deleteDocument: build.mutation<string, string>({
      queryFn: (id) => run(() => documents.deleteDocument(id)),
      invalidatesTags: ['Document'],
    }),

    uploadDocumentFile: build.mutation<
      string,
      { localUri: string; fileName: string; mimeType: string }
    >({
      queryFn: ({ localUri, fileName, mimeType }) =>
        run(() => documents.uploadDocumentFile(localUri, fileName, mimeType)),
    }),

    /* ── Climate & comfort ────────────────────────────────────────────── */

    getClimateRecords: build.query<ClimateRecord[], string | void>({
      queryFn: (vehicleId) => run(() => climate.listClimateRecords(vehicleId ?? undefined)),
      providesTags: ['Climate'],
    }),

    createClimateRecord: build.mutation<ClimateRecord, climate.ClimateDraft>({
      queryFn: (draft) => run(() => climate.createClimateRecord(draft)),
      invalidatesTags: ['Climate'],
    }),

    deleteClimateRecord: build.mutation<string, string>({
      queryFn: (id) => run(() => climate.deleteClimateRecord(id)),
      invalidatesTags: ['Climate'],
    }),

    /* ── Trips ────────────────────────────────────────────────────────── */

    getTrips: build.query<Trip[], string | void>({
      queryFn: (vehicleId) => run(() => trips.listTrips(vehicleId ?? undefined)),
      providesTags: ['Trip'],
    }),

    getTrip: build.query<Trip, string>({
      queryFn: (id) => run(() => trips.getTrip(id)),
      providesTags: (_result, _error, id) => [{ type: 'Trip', id }],
    }),

    createTrip: build.mutation<Trip, trips.TripDraft>({
      queryFn: (draft) => run(() => trips.createTrip(draft)),
      invalidatesTags: ['Trip'],
    }),

    updateTrip: build.mutation<Trip, { id: string; patch: Partial<trips.TripDraft> }>({
      queryFn: ({ id, patch }) => run(() => trips.updateTrip(id, patch)),
      invalidatesTags: ['Trip'],
    }),

    toggleTripChecklistItem: build.mutation<Trip, { tripId: string; itemId: string }>({
      queryFn: ({ tripId, itemId }) => run(() => trips.toggleTripChecklistItem(tripId, itemId)),
      invalidatesTags: ['Trip'],
    }),

    deleteTrip: build.mutation<string, string>({
      queryFn: (id) => run(() => trips.deleteTrip(id)),
      invalidatesTags: ['Trip'],
    }),

    /* ── Diagnostics ──────────────────────────────────────────────────── */

    searchDiagnosticCodes: build.query<DiagnosticCode[], diagnostics.DiagnosticFilter | void>({
      queryFn: (filter) => run(() => diagnostics.searchDiagnosticCodes(filter ?? undefined)),
      providesTags: ['Diagnostic'],
    }),

    getDiagnosticCode: build.query<DiagnosticCode, string>({
      queryFn: (code) => run(() => diagnostics.getDiagnosticCode(code)),
      providesTags: (_result, _error, code) => [{ type: 'Diagnostic', id: code }],
    }),

    /* ── Notifications ────────────────────────────────────────────────── */

    getNotifications: build.query<AppNotification[], void>({
      queryFn: () => run(() => account.listNotifications()),
      providesTags: ['Notification'],
    }),

    markNotificationRead: build.mutation<AppNotification, string>({
      queryFn: (id) => run(() => account.markNotificationRead(id)),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: build.mutation<AppNotification[], void>({
      queryFn: () => run(() => account.markAllNotificationsRead()),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
  useRequestPasswordResetMutation,

  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,

  useGetVehiclesQuery,
  useGetVehicleQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useUpdateOdometerMutation,
  useDeleteVehicleMutation,

  useGetMaintenanceQuery,
  useGetMaintenanceRecordQuery,
  useCreateMaintenanceMutation,
  useUpdateMaintenanceMutation,
  useDeleteMaintenanceMutation,

  useGetRemindersQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useCompleteReminderMutation,
  useDeleteReminderMutation,

  useGetFuelEntriesQuery,
  useCreateFuelEntryMutation,
  useUpdateFuelEntryMutation,
  useDeleteFuelEntryMutation,

  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useUploadDocumentFileMutation,

  useGetClimateRecordsQuery,
  useCreateClimateRecordMutation,
  useDeleteClimateRecordMutation,

  useGetTripsQuery,
  useGetTripQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useToggleTripChecklistItemMutation,
  useDeleteTripMutation,

  useSearchDiagnosticCodesQuery,
  useGetDiagnosticCodeQuery,

  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = autopilotApi;
