<?php

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});



use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AuthController;

// Unprotected: login route returns token when credentials match config or local faculty
Route::post('/login', [AuthController::class, 'login']);
// Signup creates a local faculty account (stored in DB) and returns a token
Route::post('/signup', [AuthController::class, 'signup']);

// Protected profile API routes — require X-Portal-Auth header or Bearer token
Route::middleware('faculty.auth')->group(function () {
    Route::get('/profiles', [ProfileController::class, 'index']);
    Route::post('/register', [ProfileController::class, 'store']);
    Route::put('/profiles/{profile}', [ProfileController::class, 'update']);
    Route::delete('/profiles/{profile}', [ProfileController::class, 'destroy']);
});


