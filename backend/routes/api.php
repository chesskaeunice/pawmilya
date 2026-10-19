<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public connectivity check used by the frontend during setup.
Route::get('/health', fn () => response()->json([
    'app' => config('app.name'),
    'status' => 'ok',
]));

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
