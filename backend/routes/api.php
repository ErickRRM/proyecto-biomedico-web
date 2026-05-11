<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

// Rutas públicas
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');
});

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });

    // Solo administradores
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users',                [UserController::class, 'index']);
        Route::post('/users',               [UserController::class, 'store']);
        Route::get('/users/{user}',         [UserController::class, 'show']);
        Route::put('/users/{user}',         [UserController::class, 'update']);
        Route::patch('/users/{user}/toggle',[UserController::class, 'toggleActivo']);
    });

});