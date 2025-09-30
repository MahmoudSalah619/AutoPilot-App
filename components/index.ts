/**
 * COMPATIBILITY LAYER - Feature-Based Architecture Migration
 * 
 * This file provides backward compatibility during the migration from atomic design
 * to feature-based architecture. It re-exports components from their new locations
 * using their original import paths.
 * 
 * TODO: Remove this file once all imports are updated to use the new structure
 */

// === SHARED UI COMPONENTS (formerly atoms) ===
export { 
  Badge,
  Button, 
  ExternalLink,
  Icon,
  Image,
  Input,
  Loading,
  Logo,
  SeperateLine,
  SnackBar,
  Text,
} from '../shared/components/ui';

// === SHARED LAYOUT COMPONENTS (formerly atoms/templates) ===
export {
  ParallaxScrollView,
  ThemedView,
  AuthScreenWrapper,
  MainScreenWrapper,
} from '../shared/components/layout';

// === SHARED UI COMPONENTS (formerly molecules/common) ===
export {
  Checkbox,
  Collapsible,
  FormInput,
  NoResults,
} from '../shared/components/ui';

// HelloWave - export separately due to named export
export { HelloWave } from '../shared/components/ui';

// === FEATURE COMPONENTS (formerly molecules/organisms scoped) ===

// Auth components
export {
  BiometricAuth,
  AppleRegistrationButton,
  FacebookRegistrationButton,
  GoogleRegistrationButton,
} from '../features/auth';

// Home components  
export {
  LastGasConsumption,
  VehicleCard,
  VehicleItemCard,
} from '../features/home';

// Profile components
export {
  ProfileHeader,
  ProfileItem,
} from '../features/profile';

// Services components
export {
  AddGasEntryModal,
  AddServiceReminderModal, 
  AddVehicleDocumentModal,
  FilterGasModal,
  FilterServiceReminderModal,
  ServiceCard,
} from '../features/services';

// Navigation components
export {
  AppHeader,
  AppTabBar,
  MainScreenOptions,
} from '../features/navigation';

// Notifications components
export {
  NotificationBell,
  UnreadMessages,
  NotificationListnerContainer,
} from '../features/notifications';

// === NAMESPACE EXPORTS FOR ATOMIC STRUCTURE COMPATIBILITY ===

// Atoms namespace (now shared UI)
import * as UI from '../shared/components/ui';
import * as Layout from '../shared/components/layout';
export const atoms = { ...UI, ...Layout };

// Molecules namespace (split between shared and features)
import * as SharedUI from '../shared/components/ui';
import * as Auth from '../features/auth';
import * as Home from '../features/home'; 
import * as Profile from '../features/profile';
import * as Services from '../features/services';
import * as Navigation from '../features/navigation';
import * as Notifications from '../features/notifications';

export const molecules = {
  common: SharedUI,
  scoped: {
    auth: Auth,
    home: Home,
    profile: Profile,
    services: Services,
    navigation: Navigation,
    notifications: Notifications,
  }
};

// Organisms namespace (same as molecules for feature components)
export const organisms = molecules;

// Templates namespace (now shared layout)
export const templates = Layout;