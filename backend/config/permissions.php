<?php

// Permissions per role. Keep in sync with frontend/src/config/rolePermissions.js.
return [

    'citizen' => [],

    'kennel_manager' => [
        'dashboard.view',
        'animals.view', 'animals.create', 'animals.edit', 'animals.delete', 'animals.photo',
        'qr.generate',
        'adoptionApplications.view', 'adoptionApplications.review', 'adoptionApplications.approve',
        'adoptionApplications.reject', 'adoptionApplications.export',
        'missingPets.view', 'missingPets.edit', 'missingPets.updateStatus',
        'vaccinations.view', 'vaccinations.create', 'vaccinations.edit', 'vaccinations.delete',
        'reports.view', 'reports.all',
        'settings.view', 'settings.system',
        'shifts.manage',
    ],

    'adoption_counselor' => [
        'dashboard.view',
        'animals.view', 'animals.adoptionUpdate', 'animals.photo',
        'adoptionApplications.view', 'adoptionApplications.review', 'adoptionApplications.approve',
        'adoptionApplications.reject',
        'missingPets.view', 'missingPets.edit', 'missingPets.updateStatus',
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
        'animals.view', 'animals.husbandryUpdate', 'animals.photo',
        'qr.generate',
        'missingPets.view',
        'vaccinations.view',
        'settings.view', 'settings.ownAccount',
        'shifts.viewOwn',
    ],

];
