<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProspectController;
use App\Http\Middleware\CheckPermission;
use App\Http\Controllers\Api\ProjectController;

Route::middleware('auth:sanctum')->group(function () {

    // Projects CRUD Routes
    Route::get('/projects', [ProjectController::class, 'index'])
        ->middleware(CheckPermission::class . ':projects.view');

    Route::post('/projects', [ProjectController::class, 'store'])
        ->middleware(CheckPermission::class . ':projects.create');

    Route::get('/projects/{project}', [ProjectController::class, 'show'])
        ->middleware(CheckPermission::class . ':projects.view');

    Route::put('/projects/{project}', [ProjectController::class, 'update'])
        ->middleware(CheckPermission::class . ':projects.edit');

    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])
        ->middleware(CheckPermission::class . ':projects.delete');
});
// Public route
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Prospects CRUD
    Route::get('/prospects', [ProspectController::class, 'index'])
        ->middleware(CheckPermission::class . ':prospects.view');

    Route::post('/prospects', [ProspectController::class, 'store'])
        ->middleware(CheckPermission::class . ':prospects.create');

    Route::get('/prospects/{prospect}', [ProspectController::class, 'show'])
        ->middleware(CheckPermission::class . ':prospects.view');

    Route::put('/prospects/{prospect}', [ProspectController::class, 'update'])
        ->middleware(CheckPermission::class . ':prospects.edit');

    Route::delete('/prospects/{prospect}', [ProspectController::class, 'destroy'])
        ->middleware(CheckPermission::class . ':prospects.delete');
});