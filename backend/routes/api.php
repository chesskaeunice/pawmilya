<?php

use App\Http\Controllers\AdoptionApplicationController;
use App\Http\Controllers\AnimalController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MyShiftController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\PetCareArticleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\VaccinationController;
use App\Http\Controllers\VaccineController;
use App\Http\Controllers\MissingPetReportController;
use App\Http\Controllers\PublicAnimalController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public connectivity check used by the frontend during setup.
Route::get('/health', fn () => response()->json([
    'app' => config('app.name'),
    'status' => 'ok',
]));

// Auth (Sanctum Bearer tokens). Login and register are rate limited.
// Login has its own email+IP lockout (LoginGuard); register is 5 per hour per IP.
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordController::class, 'forgot'])->middleware('throttle:password-reset');
Route::post('/reset-password', [PasswordController::class, 'reset'])->middleware('throttle:password-reset');

// password.changed blocks everything except me/logout/change-password while a temporary password is set
Route::middleware(['auth:sanctum', 'password.changed'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [PasswordController::class, 'change'])->middleware('throttle:5,1');
    Route::patch('/profile/email', [ProfileController::class, 'updateEmail'])->middleware('throttle:10,1');
    Route::patch('/profile/address', [ProfileController::class, 'updateAddress'])->middleware('throttle:10,1');
    Route::post('/me/avatar', [ProfileController::class, 'updateAvatar'])->middleware('throttle:10,1');
    Route::delete('/me/avatar', [ProfileController::class, 'deleteAvatar'])->middleware('throttle:10,1');

    // Staff animals (field-level permissions for update are in UpdateAnimalRequest)
    Route::get('/animals', [AnimalController::class, 'index'])->middleware('permission:animals.view');
    Route::get('/animals/{animal}', [AnimalController::class, 'show'])->middleware('permission:animals.view');
    Route::get('/animals/{animal}/history', [AnimalController::class, 'history'])->middleware('permission:animals.view');
    Route::get('/animals/{animal}/qr', [AnimalController::class, 'qr'])->middleware('permission:qr.generate');
    Route::post('/animals', [AnimalController::class, 'store'])->middleware('permission:animals.create');
    Route::patch('/animals/{animal}', [AnimalController::class, 'update'])->middleware('permission:animals.view');
    Route::post('/animals/{animal}/photo', [AnimalController::class, 'updatePhoto'])->middleware(['permission:animals.photo', 'throttle:30,1']);
    Route::delete('/animals/{animal}',[AnimalController::class, 'destroy'])->middleware('permission:animals.delete');

    // Adoption applications: citizens submit and see their own (duplicates are blocked in the request and the database)
    Route::middleware('role:citizen')->group(function () {
        Route::post('/adoption-applications', [AdoptionApplicationController::class, 'store'])->middleware('throttle:10,1');
        Route::get('/my/adoption-applications', [AdoptionApplicationController::class, 'mine']);
    });

    // Vaccinations (health logs)
    Route::get('/vaccines', [VaccineController::class, 'index'])->middleware('permission:vaccinations.view');
    Route::get('/vaccinations', [VaccinationController::class, 'index'])->middleware('permission:vaccinations.view');
    Route::post('/vaccinations', [VaccinationController::class, 'store'])->middleware('permission:vaccinations.view');
    Route::patch('/vaccinations/{log}', [VaccinationController::class, 'update'])->middleware('permission:vaccinations.view');
    Route::delete('/vaccinations/{log}', [VaccinationController::class, 'destroy'])->middleware('permission:vaccinations.delete');

    // Reports page: each report checks its own permission (see ReportController)
    Route::prefix('reports')->group(function () {
        Route::get('/animals', [ReportController::class, 'animals']);
        Route::get('/adoptions', [ReportController::class, 'adoptions']);
        Route::get('/missing-pets', [ReportController::class, 'missingPets']);
        Route::get('/vaccinations', [ReportController::class, 'vaccinations']);
        Route::get('/health', [ReportController::class, 'health']);
    });

    // Staff accounts and the audit trail (kennel manager)
    Route::middleware('permission:settings.system')->group(function () {
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::patch('/users/{user}', [UserManagementController::class, 'update']);
        Route::get('/audit-logs', [AuditLogController::class, 'index']);

        // Public site content (pound info, donation QR, about, in-kind wishlist)
        Route::get('/site-content', [SiteContentController::class, 'show']);
        Route::put('/site-content', [SiteContentController::class, 'update']);
        Route::patch('/pound-info', [SiteContentController::class, 'updatePound']);
        Route::post('/site-content/images/{slot}', [SiteContentController::class, 'uploadImage'])->middleware('throttle:30,1');
        Route::delete('/site-content/images/{slot}', [SiteContentController::class, 'deleteImage']);
    });

    // Staff Schedule (kennel manager)
    Route::middleware('permission:shifts.manage')->prefix('schedule')->group(function () {
        Route::get('/meta', [ScheduleController::class, 'meta']);
        Route::get('/assignments', [ScheduleController::class, 'assignments']);
        Route::get('/today', [ScheduleController::class, 'today']);
        Route::post('/assignments', [ScheduleController::class, 'store']);
        Route::patch('/assignments/{assignment}/status', [ScheduleController::class, 'updateStatus']);
        Route::delete('/assignments/{assignment}', [ScheduleController::class, 'destroy']);
    });

    // My Shifts (pound staff, vet tech, adoption counselor)
    Route::middleware('permission:shifts.viewOwn')->prefix('my/shifts')->group(function () {
        Route::get('/', [MyShiftController::class, 'index']);
        Route::post('/{id}/check-in', [MyShiftController::class, 'checkIn'])->whereNumber('id');
        Route::post('/{id}/check-out', [MyShiftController::class, 'checkOut'])->whereNumber('id');
    });

    // My missing pet reports
    Route::middleware('role:citizen')->group(function () {
        Route::get('/my/missing-pets', [MissingPetReportController::class, 'mine']);
        Route::post('/my/missing-pets/{report}/reunited', [MissingPetReportController::class, 'markReunited']);
    });

    // Staff: missing pet reports (with reporter contact), status, and matches against pound animals
    Route::get('/missing-pet-reports', [MissingPetReportController::class, 'staffIndex'])->middleware('permission:missingPets.view');
    Route::get('/missing-pet-reports/{report}', [MissingPetReportController::class, 'staffShow'])->middleware('permission:missingPets.view');
    Route::get('/missing-pet-reports/{report}/matches', [MissingPetReportController::class, 'matches'])->middleware('permission:missingPets.view');
    Route::patch('/missing-pet-reports/{report}/status', [MissingPetReportController::class, 'updateStatus'])->middleware('permission:missingPets.updateStatus');

    // A Found report: register the pet as an animal in the pound (pound staff)
    Route::post('/missing-pets/{report}/register-animal', [MissingPetReportController::class, 'registerAnimal'])->middleware(['permission:animals.registerFromReport', 'throttle:10,1']);

    // Staff review
    Route::get('/adoption-applications', [AdoptionApplicationController::class, 'index'])->middleware('permission:adoptionApplications.view');
    Route::get('/adoption-applications/{application}', [AdoptionApplicationController::class, 'show'])->middleware('permission:adoptionApplications.view');
    Route::post('/adoption-applications/{application}/approve', [AdoptionApplicationController::class, 'approve'])->middleware('permission:adoptionApplications.approve');
    Route::post('/adoption-applications/{application}/reject', [AdoptionApplicationController::class, 'reject'])->middleware('permission:adoptionApplications.reject');
});

// Missing pets: public list and details; guests may file a report (a token, when sent, links it to the citizen)
Route::get('/missing-pets', [MissingPetReportController::class, 'index']);
Route::get('/missing-pets/{id}', [MissingPetReportController::class, 'show'])->whereNumber('id');
Route::post('/missing-pets', [MissingPetReportController::class, 'store'])->middleware('throttle:10,1');

// Public site content for the footer, About section and donation pop-ups
Route::get('/public/site-info', [SiteContentController::class, 'publicInfo']);

// Pet Care Corner: pet care articles from Google News (cached for 1 hour)
Route::get('/pet-care-articles', [PetCareArticleController::class, 'index'])->middleware('throttle:60,1');

// Public adoptable pets and the stray QR page
Route::get('/pets', [PublicAnimalController::class, 'index']);
Route::get('/pets/{id}', [PublicAnimalController::class, 'show'])->whereNumber('id');
Route::get('/stray/{token}', [PublicAnimalController::class, 'stray'])->middleware('throttle:60,1');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Private ID and home photos: only reachable through the signed, expiring links in the staff API
Route::get('/adoption-applications/{application}/files/{type}/{index}', [AdoptionApplicationController::class, 'file'])
    ->whereIn('type', ['id', 'home'])->whereNumber('index')
    ->middleware('signed')->name('application.file');
