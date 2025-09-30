#!/usr/bin/env node

/**
 * Import Migration Script
 * 
 * This script updates all import statements from the old atomic design structure
 * to the new feature-based architecture.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import mapping from old to new structure
const importMap = {
  // Atoms (now shared/components/ui)
  "@/components/atoms": "@/shared/components/ui",
  
  // Molecules common (now shared/components/ui) 
  "@/components/molecules/common": "@/shared/components/ui",
  
  // Templates (now shared/components/layout)
  "@/components/templates/AuthScreenWrapper": "@/shared/components/layout",
  "@/components/templates/MainScreenWrapper": "@/shared/components/layout",
  
  // Organisms scoped - by feature
  "@/components/organisms/scoped/auth": "@/features/auth",
  "@/components/organisms/scoped/navigation": "@/features/navigation", 
  "@/components/organisms/scoped/services": "@/features/services",
  "@/components/organisms/scoped/VehicleCard": "@/features/home",
  "@/components/organisms/scoped/LastGasConsumption": "@/features/home",
  
  // Molecules scoped - by feature
  "@/components/molecules/scoped/ProfileHeader": "@/features/profile",
  "@/components/molecules/scoped/ProfileItem": "@/features/profile",
  "@/components/molecules/scoped/ServiceCard": "@/features/services",
  
  // Common modals (now shared/components/layout)
  "@/components/organisms/common/modals": "@/shared/components/layout/modals"
};

// Specific component mappings
const componentMap = {
  "AuthScreenWrapper": { from: "@/components/templates/AuthScreenWrapper", to: "{ AuthScreenWrapper } from '@/shared/components/layout'" },
  "MainScreenWrapper": { from: "@/components/templates/MainScreenWrapper", to: "{ MainScreenWrapper } from '@/shared/components/layout'" },
  "Biometric": { from: "@/components/organisms/scoped/auth/biometric", to: "{ BiometricAuth } from '@/features/auth'" },
  "VehicleCardOrganism": { from: "@/components/organisms/scoped/VehicleCard", to: "{ VehicleCard } from '@/features/home'" }
};

console.log('🚀 Starting import migration...');
console.log('📂 Scanning app directory for TypeScript files...');

// Find all TypeScript files in app directory
const files = glob.sync('app/**/*.{ts,tsx}', { cwd: process.cwd() });
console.log(`📄 Found ${files.length} files to process`);

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Apply import mappings
  Object.entries(importMap).forEach(([oldImport, newImport]) => {
    if (content.includes(oldImport)) {
      content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
      hasChanges = true;
    }
  });
  
  // Apply specific component mappings
  Object.entries(componentMap).forEach(([component, mapping]) => {
    if (content.includes(mapping.from)) {
      content = content.replace(mapping.from, mapping.to);
      hasChanges = true;
    }
  });
  
  // Handle default to named export changes
  content = content.replace(/import AuthScreenWrapper from '@\/shared\/components\/layout'/g, "import { AuthScreenWrapper } from '@/shared/components/layout'");
  content = content.replace(/import MainScreenWrapper from '@\/shared\/components\/layout'/g, "import { MainScreenWrapper } from '@/shared/components/layout'");
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${file}`);
    updatedCount++;
  }
});

console.log(`🎉 Migration complete! Updated ${updatedCount} files.`);
console.log('📝 Next steps:');
console.log('   1. Test your app to ensure all imports work');
console.log('   2. Remove the compatibility layer when ready');
console.log('   3. Update any remaining manual imports');