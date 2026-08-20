<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProspectController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

/*
|--------------------------------------------------------------------------
| Protected Routes — auth:sanctum + Spatie role/permission middleware
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ──────────────────────────────────────────────────────────
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ── Dashboard (any authenticated user) ────────────────────────────
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // ── User Management — Administrateur only ─────────────────────────
    Route::middleware('role:Administrateur')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('roles', RoleController::class);
        Route::get('/permissions', [RoleController::class, 'permissions']);
    });

    // ── Prospects — Administrateur & Assistante ───────────────────────
    Route::middleware('permission:prospects.view')->group(function () {
        Route::apiResource('prospects', ProspectController::class);

        Route::middleware('permission:prospects.convert')->group(function () {
            Route::post('/prospects/{prospect}/convert', [ProspectController::class, 'convert']);
        });
    });

    // ── Clients — Admin, Architecte, Assistante ──────────────────────
    Route::middleware('permission:clients.view')->group(function () {
        Route::apiResource('clients', ClientController::class);
    });

    // ── Projects — Admin, Architecte (full), Collaborateur (view via policy) ──
    Route::middleware('permission:projects.view')->group(function () {
        Route::apiResource('projects', ProjectController::class);
    });

    // ── Tasks — Admin, Architecte (full), Collaborateur (view/edit via policy) ──
    Route::middleware('permission:tasks.view')->group(function () {
        Route::apiResource('tasks', TaskController::class);
    });

    // ── Documents — all roles (policy handles membership checks) ──────
    Route::middleware('permission:documents.view')->group(function () {
        Route::apiResource('documents', DocumentController::class);
        Route::apiResource('folders', FolderController::class)->only(['index', 'store', 'destroy']);
    });

    // ── Events / Planning — Admin, Architecte, Assistante ────────────
    Route::middleware('permission:events.view')->group(function () {
        Route::apiResource('events', EventController::class);
    });

    // ── Lookup / Reference Data ──────────────────────────────────────
    Route::get('/prospects-statuses', fn () => response()->json(\App\Models\ProspectStatus::where('is_active', true)->orderBy('sort_order')->get()));
    Route::get('/prospect-sources', fn () => response()->json(\App\Models\ProspectSource::where('is_active', true)->orderBy('sort_order')->get()));
    Route::get('/project-statuses', fn () => response()->json(\App\Models\ProjectStatus::where('is_active', true)->orderBy('sort_order')->get()));
    Route::get('/project-types', fn () => response()->json(\App\Models\ProjectType::where('is_active', true)->orderBy('sort_order')->get()));
    Route::get('/task-statuses', fn () => response()->json(\App\Models\TaskStatus::where('is_active', true)->orderBy('sort_order')->get()));
    Route::get('/users-list', fn () => response()->json(
        User::select('id', 'first_name', 'last_name', 'email', 'avatar_path', 'is_active', 'status')->get()
    ));
});
