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
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CourseSectionController;
use App\Http\Controllers\Api\SectionStudentController;

// Unprotected: login route returns token when credentials match config or local faculty
Route::post('/login', [AuthController::class, 'login']);
// Signup creates a local faculty account (stored in DB) and returns a token
Route::post('/signup', [AuthController::class, 'signup']);

// Protected profile API routes — require X-Portal-Auth header or Bearer token
Route::middleware('faculty.auth')->group(function () {
    // OLD PROFILE ROUTES - DISABLED (now using section_students table)
    // Route::get('/profiles', [ProfileController::class, 'index']);
    // Route::post('/register', [ProfileController::class, 'store']);
    // Route::post('/profiles', [ProfileController::class, 'store']);
    // Route::get('/profiles/{profile}', [ProfileController::class, 'show']);
    // Route::put('/profiles/{profile}', [ProfileController::class, 'update']);
    // Route::delete('/profiles/{profile}', [ProfileController::class, 'destroy']);

    // Faculty self profile endpoints
    Route::get('/faculty/me', [FacultyController::class, 'me']);
    Route::put('/faculty/me', [FacultyController::class, 'updateMe']);
    
    // Image upload endpoint
    Route::post('/upload-image', [App\Http\Controllers\ImageUploadController::class, 'upload']);

    // Calendar Events API
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events/{event}', [EventController::class, 'show']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);

    // Courses API
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

    // Course Sections API
    Route::get('/courses/{course}/sections', [CourseSectionController::class, 'index']);
    Route::post('/courses/{course}/sections', [CourseSectionController::class, 'store']);
    Route::get('/courses/{course}/sections/{section}', [CourseSectionController::class, 'show']);
    Route::put('/courses/{course}/sections/{section}', [CourseSectionController::class, 'update']);
    Route::delete('/courses/{course}/sections/{section}', [CourseSectionController::class, 'destroy']);

    // All Students API (for Students page)
    Route::get('/students/all', [SectionStudentController::class, 'all']);
    Route::get('/students/{id}', [SectionStudentController::class, 'getStudent']);
    Route::put('/students/{id}', [SectionStudentController::class, 'updateStudent']);
    Route::delete('/students/{id}', [SectionStudentController::class, 'deleteStudent']);
    Route::put('/students/{id}/status', [SectionStudentController::class, 'updateStatus']);
    Route::post('/students/{id}/upload-picture', [SectionStudentController::class, 'uploadProfilePicture']);
    Route::delete('/students/{id}/delete-picture', [SectionStudentController::class, 'deleteProfilePicture']);

    // Section Students API
    Route::get('/courses/{course}/sections/{section}/students', [SectionStudentController::class, 'index']);
    Route::post('/courses/{course}/sections/{section}/students', [SectionStudentController::class, 'store']);
    Route::get('/courses/{course}/sections/{section}/students/{student}', [SectionStudentController::class, 'show']);
    Route::put('/courses/{course}/sections/{section}/students/{student}', [SectionStudentController::class, 'update']);
    Route::delete('/courses/{course}/sections/{section}/students/{student}', [SectionStudentController::class, 'destroy']);
});


