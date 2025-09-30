# AutoPilot App - Feature-Based Architecture

## 🏗️ Architecture Overview

This project now uses a **Feature-Based Architecture** instead of the traditional Atomic Design pattern, providing better organization, maintainability, and team collaboration.

## 📁 Project Structure

```
📁 AutoPilot App/
├── 📁 features/                 # Feature-specific code
│   ├── 📁 auth/                # Authentication & Registration
│   │   ├── 📁 components/      # Auth-specific components
│   │   ├── 📁 hooks/           # Auth-related custom hooks  
│   │   ├── 📁 types/           # Auth type definitions
│   │   ├── 📁 utils/           # Auth utility functions
│   │   └── 📄 index.ts         # Feature exports
│   │
│   ├── 📁 home/                # Dashboard & Home Screen
│   │   ├── 📁 components/      # Home components (VehicleCard, etc.)
│   │   ├── 📁 hooks/           # Home-related hooks
│   │   ├── 📁 utils/           # Home utility functions  
│   │   └── 📄 index.ts
│   │
│   ├── 📁 profile/             # User Profile Management
│   │   ├── 📁 components/      # Profile components
│   │   ├── 📁 hooks/           # Profile-related hooks
│   │   └── 📄 index.ts
│   │
│   ├── 📁 maintenance/         # Vehicle Maintenance
│   │   ├── 📁 components/      # Maintenance components
│   │   ├── 📁 hooks/           # Maintenance hooks
│   │   └── 📄 index.ts
│   │
│   ├── 📁 services/            # Service Management
│   │   ├── 📁 components/      # Service components & modals
│   │   ├── 📁 hooks/           # Service-related hooks
│   │   └── 📄 index.ts
│   │
│   ├── 📁 calendar/            # Scheduling & Calendar
│   ├── 📁 navigation/          # Navigation Components  
│   ├── 📁 notifications/       # Notification System
│   └── 📄 index.ts             # All features export
│
├── 📁 shared/                   # Shared across features
│   ├── 📁 components/
│   │   ├── 📁 ui/              # Basic UI components (Button, Input, etc.)
│   │   └── 📁 layout/          # Layout components, modals, wrappers
│   └── 📄 index.ts
│
├── 📁 app/                     # App screens (Expo Router)
├── 📁 apis/                    # API services  
├── 📁 hooks/                   # Global hooks
├── 📁 redux/                   # State management
├── 📁 utils/                   # Global utilities
├── 📁 constants/               # App constants
├── 📁 assets/                  # Images, fonts, etc.
└── 📄 MIGRATION_GUIDE.md       # Migration documentation
```

## 🎯 Feature Organization

Each feature folder follows this structure:

```
📁 feature-name/
├── 📁 components/              # Feature-specific components
│   ├── 📄 ComponentA.tsx      # Individual components
│   ├── 📄 ComponentB.tsx
│   └── 📄 index.ts            # Component exports
├── 📁 hooks/                  # Feature-specific hooks
│   ├── 📄 useFeatureHook.ts   # Custom hooks
│   └── 📄 index.ts            # Hook exports  
├── 📁 types/                  # Feature-specific types
│   └── 📄 index.ts            # Type definitions
├── 📁 utils/                  # Feature-specific utilities
│   └── 📄 index.ts            # Utility exports
└── 📄 index.ts                # Main feature exports
```

## 📦 Import Examples

### Shared Components
```typescript
// UI Components
import { Button, Text, Input, Icon } from '@/shared/components/ui';

// Layout Components  
import { ThemedView, AuthScreenWrapper } from '@/shared/components/layout';

// Modals & Bottomsheets
import { ModalWrapper, SheetWrapper } from '@/shared/components/layout';
```

### Feature Components
```typescript
// Auth Feature
import { BiometricAuth, GoogleRegistrationButton } from '@/features/auth';

// Home Feature
import { VehicleCard, LastGasConsumption } from '@/features/home';

// Profile Feature  
import { ProfileHeader, ProfileItem } from '@/features/profile';

// Services Feature
import { ServiceCard, AddGasEntryModal } from '@/features/services';
```

### Feature Hooks & Utils
```typescript
// Feature-specific hooks
import { useAuth, useLoginForm } from '@/features/auth/hooks';
import { useVehicleData } from '@/features/home/hooks';

// Feature-specific utilities
import { validateEmail } from '@/features/auth/utils';
import { calculateFuelEfficiency } from '@/features/home/utils';
```

## 🔧 Development Guidelines

### Adding New Components

1. **Shared Component** (used across multiple features):
   ```bash
   # Add to shared/components/ui/ or shared/components/layout/
   shared/components/ui/NewComponent/
   ├── index.tsx
   ├── styles.ts
   └── types.ts
   ```

2. **Feature Component** (specific to one feature):
   ```bash
   # Add to the specific feature folder
   features/feature-name/components/NewComponent/
   ├── index.tsx
   ├── styles.ts  
   └── types.ts
   ```

### Adding New Features

1. Create feature folder structure:
   ```bash
   features/new-feature/
   ├── components/
   ├── hooks/
   ├── types/
   ├── utils/
   └── index.ts
   ```

2. Add feature export to `features/index.ts`
3. Create appropriate component and hook files

## ✅ Benefits

- **🎯 Feature Isolation**: Each feature is self-contained
- **👥 Team Collaboration**: Teams can work independently on features  
- **🔄 Reusability**: Clear separation of shared vs feature-specific code
- **📈 Scalability**: Easy to add new features without affecting existing ones
- **🧪 Testing**: Components can be tested within their feature context
- **🗂️ Organization**: Components grouped by business functionality
- **🚀 Performance**: Better code splitting and bundle optimization

## 🔄 Migration Status

- [x] ✅ Create new feature-based structure
- [x] ✅ Move components to appropriate locations  
- [x] ✅ Create index files for easy imports
- [x] ✅ Add compatibility layer for smooth transition
- [x] ✅ Create migration documentation
- [ ] 🔄 Update import statements in screens
- [ ] 🔄 Update component references  
- [ ] 🔄 Test all features functionality
- [ ] 🔄 Remove compatibility layer

## 📚 Resources

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Detailed migration instructions
- [Feature-Based Architecture Best Practices](https://blog.angular-university.io/angular-2-redux-ngrx-rxjs/)
- [React Project Structure](https://blog.webdevsimplified.com/2022-07/react-folder-structure/)

---

**Happy Coding! 🚀**