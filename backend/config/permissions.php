<?php

// Permissions per role. Keep in sync with frontend/src/config/rolePermissions.js.
return [

    'citizen' => [],

    // Overview of the whole system, not hands-on: sees everything, plus Staff Schedule,
    // Users, Audit Logs and the website settings (settings.system)
    'kennel_manager' => [
        'dashboard.view',
        'animals.view', 'animals.neuteredUpdate', 'qr.view',
        'adoptionApplications.view', 'adoptionApplications.export',
        'missingPets.view', 'claims.view',
        'vaccinations.view',
        'reports.view', 'reports.all',
        'settings.view', 'settings.system',
        'shifts.manage',
    ],

    'adoption_counselor' => [
        'dashboard.view',
        'animals.view', 'animals.adoptionUpdate', 'animals.photo',
        'adoptionApplications.view', 'adoptionApplications.review', 'adoptionApplications.approve',
        'adoptionApplications.reject', 'adoptionApplications.verifyId',
        'missingPets.view',
        'vaccinations.view',
        'reports.view', 'reports.adoption', 'reports.missingPets',
        'settings.view', 'settings.ownAccount',
        'shifts.viewOwn',
    ],

    'vet_tech' => [
        'dashboard.view',
        'animals.view', 'animals.healthUpdate', 'animals.photo',
        'missingPets.view',
        'vaccinations.view', 'vaccinations.create', 'vaccinations.edit', 'vaccinations.delete',
        'reports.view', 'reports.health', 'reports.vaccinations',
        'settings.view', 'settings.ownAccount',
        'shifts.viewOwn',
    ],

    'pound_staff' => [
        'dashboard.view',
        'animals.view', 'animals.create', 'animals.edit', 'animals.delete', 'animals.husbandryUpdate', 'animals.photo',
        'animals.registerFromReport',
        'qr.view',
        'missingPets.view', 'missingPets.updateStatus', 'claims.view', 'claims.decide',
        'vaccinations.view',
        'settings.view', 'settings.ownAccount',
        'shifts.viewOwn',
    ],

];
