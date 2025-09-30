# PowerShell Import Migration Script
# Updates all import statements from old atomic design to new feature-based structure

Write-Host "🚀 Starting import migration..." -ForegroundColor Green

# Get all TypeScript files in app directory
$files = Get-ChildItem -Path "app" -Recurse -Include "*.tsx", "*.ts"
Write-Host "📄 Found $($files.Count) files to process" -ForegroundColor Cyan

$updatedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace import paths
    $content = $content -replace '@/components/atoms', '@/shared/components/ui'
    $content = $content -replace '@/components/molecules/common', '@/shared/components/ui'
    $content = $content -replace '@/components/templates/AuthScreenWrapper', '@/shared/components/layout'
    $content = $content -replace '@/components/templates/MainScreenWrapper', '@/shared/components/layout'
    $content = $content -replace '@/components/organisms/scoped/auth/biometric', '@/features/auth'
    $content = $content -replace '@/components/organisms/scoped/navigation/MainScreenOptions', '@/features/navigation'
    $content = $content -replace '@/components/organisms/scoped/services', '@/features/services'
    $content = $content -replace '@/components/organisms/scoped/VehicleCard', '@/features/home'
    $content = $content -replace '@/components/organisms/scoped/LastGasConsumption', '@/features/home'
    $content = $content -replace '@/components/molecules/scoped/ProfileHeader', '@/features/profile'
    $content = $content -replace '@/components/molecules/scoped/ProfileItem', '@/features/profile'
    $content = $content -replace '@/components/molecules/scoped/ServiceCard', '@/features/services'
    $content = $content -replace '@/components/organisms/common/modals', '@/shared/components/layout/modals'
    
    # Fix default imports to named imports
    $content = $content -replace 'import AuthScreenWrapper from ''@/shared/components/layout''', 'import { AuthScreenWrapper } from ''@/shared/components/layout'''
    $content = $content -replace 'import MainScreenWrapper from ''@/shared/components/layout''', 'import { MainScreenWrapper } from ''@/shared/components/layout'''
    
    # Fix specific component names
    $content = $content -replace 'import Biometric from ''@/features/auth''', 'import { BiometricAuth } from ''@/features/auth'''
    $content = $content -replace 'import VehicleCardOrganism from ''@/features/home''', 'import { VehicleCard } from ''@/features/home'''
    $content = $content -replace 'import LastGasConsumption from ''@/features/home''', 'import { LastGasConsumption } from ''@/features/home'''
    $content = $content -replace '<VehicleCardOrganism', '<VehicleCard'
    $content = $content -replace '</VehicleCardOrganism>', '</VehicleCard>'
    $content = $content -replace '<Biometric', '<BiometricAuth'
    $content = $content -replace '</Biometric>', '</BiometricAuth>'
    
    # Handle individual component imports
    $content = $content -replace 'import AddServiceReminderModal from ''@/features/services''', 'import { AddServiceReminderModal } from ''@/features/services'''
    $content = $content -replace 'import FilterServiceReminderModal from ''@/features/services''', 'import { FilterServiceReminderModal } from ''@/features/services'''
    $content = $content -replace 'import AddGasEntryModal from ''@/features/services''', 'import { AddGasEntryModal } from ''@/features/services'''
    $content = $content -replace 'import FilterGasModal from ''@/features/services''', 'import { FilterGasModal } from ''@/features/services'''
    $content = $content -replace 'import AddVehicleDocumentModal from ''@/features/services''', 'import { AddVehicleDocumentModal } from ''@/features/services'''
    $content = $content -replace 'import ProfileHeader from ''@/features/profile''', 'import { ProfileHeader } from ''@/features/profile'''
    $content = $content -replace 'import ProfileItem from ''@/features/profile''', 'import { ProfileItem } from ''@/features/profile'''
    $content = $content -replace 'import ServiceCard from ''@/features/services''', 'import { ServiceCard } from ''@/features/services'''
    $content = $content -replace 'import MainScreenOptions from ''@/features/navigation''', 'import { MainScreenOptions } from ''@/features/navigation'''
    
    # Handle modals
    $content = $content -replace 'import AddMaintenanceModal from ''@/shared/components/layout/modals''', 'import { AddMaintenanceModal } from ''@/shared/components/layout/modals'''
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Updated: $($file.Name)" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host ""
Write-Host "🎉 Migration complete! Updated $updatedCount files." -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Test your app to ensure all imports work" -ForegroundColor White
Write-Host "   2. Check for any remaining import errors" -ForegroundColor White
Write-Host "   3. Remove the compatibility layer when ready" -ForegroundColor White