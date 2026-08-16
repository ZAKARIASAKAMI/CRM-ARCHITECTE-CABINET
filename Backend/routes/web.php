<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'CRM Architecture API',
        'version' => '1.0.0',
        'status' => 'OK',
        'endpoints' => [
            'POST' => '/api/login',
            'GET' => '/api/me',
            'POST' => '/api/logout',
            'GET' => '/api/prospects',
            'POST' => '/api/prospects',
            'GET' => '/api/prospects/{id}',
            'PUT' => '/api/prospects/{id}',
            'DELETE' => '/api/prospects/{id}',
        ],
    ]);
});
