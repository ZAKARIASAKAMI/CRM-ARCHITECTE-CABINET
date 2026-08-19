<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProspectController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Models\ProspectStatus;
use App\Models\ProspectSource;
use App\Models\ProjectStatus;
use App\Models\ProjectType;
use App\Models\TaskStatus;
use App\Models\User;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Projects CRUD
    Route::apiResource('projects', ProjectController::class);

    // Clients CRUD
    Route::apiResource('clients', ClientController::class);

    // Prospects CRUD
    Route::apiResource('prospects', ProspectController::class);
    Route::post('/prospects/{prospect}/convert', [ProspectController::class, 'convert']);

    // Tasks CRUD
    Route::apiResource('tasks', TaskController::class);

    // Users CRUD
    Route::apiResource('users', UserController::class);

    // Documents CRUD
    Route::apiResource('documents', DocumentController::class);

    // Events / Planning CRUD
    Route::apiResource('events', EventController::class);

    // Reference & Lookup Data Endpoints
    Route::get('/prospects-statuses', function () {
        return response()->json(ProspectStatus::where('is_active', true)->orderBy('sort_order')->get());
    });

    Route::get('/prospect-sources', function () {
        return response()->json(ProspectSource::where('is_active', true)->orderBy('sort_order')->get());
    });

    Route::get('/project-statuses', function () {
        return response()->json(ProjectStatus::where('is_active', true)->orderBy('sort_order')->get());
    });

    Route::get('/project-types', function () {
        return response()->json(ProjectType::where('is_active', true)->orderBy('sort_order')->get());
    });

    Route::get('/task-statuses', function () {
        return response()->json(TaskStatus::where('is_active', true)->orderBy('sort_order')->get());
    });

    Route::get('/users-list', function () {
        return response()->json(User::select('id', 'first_name', 'last_name', 'email', 'avatar', 'status')->get());
    });
});