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

// Sample API for profiles (for React frontend)
Route::get('/profiles', function () {
    return Profile::all();
});

Route::post('/register', function (Request $request) {
    $profile = Profile::create([
        'fname' => $request->input('fname'),
        'lname' => $request->input('lname'),
    ]);
    return $profile;
});


