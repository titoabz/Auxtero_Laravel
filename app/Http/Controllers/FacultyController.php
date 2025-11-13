<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;

class FacultyController extends Controller
{
    protected function tokenFrom(Request $request): ?string
    {
        return $request->header('X-Portal-Auth') ?: $request->bearerToken();
    }

    public function me(Request $request)
    {
        $token = $this->tokenFrom($request);
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $faculty = Faculty::where('token', $token)->first();
        if (!$faculty) {
            // If static token was used, return a minimal profile
            if ($token === config('faculty.token')) {
                $user = config('faculty.user');
                $parts = preg_split('/[\.\s_@\-]+/', $user);
                $first = $parts[0] ?? $user;
                return response()->json([
                    'username' => $user,
                    'first_name' => ucfirst(strtolower($first)),
                    'last_name' => null,
                    'middle_name' => null,
                    'employee_id' => null,
                    'email' => $user . '@faculty.local',
                ]);
            }
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json([
            'username' => $faculty->username,
            'first_name' => $faculty->first_name,
            'last_name' => $faculty->last_name,
            'middle_name' => $faculty->middle_name ?? null,
            'employee_id' => $faculty->employee_id,
            'email' => $faculty->email,
            'profile_picture' => $faculty->profile_picture ?? null,
            'position' => $faculty->position ?? null,
            'department' => $faculty->department ?? null,
            'bio' => $faculty->bio ?? null,
            'office_location' => $faculty->office_location ?? null,
            'phone' => $faculty->phone ?? null,
            'office_hours' => $faculty->office_hours ?? null,
            'years_experience' => $faculty->years_experience ?? null,
            'at_university_since' => $faculty->at_university_since ?? null,
            'publications' => $faculty->publications ?? null,
            'courses_teaching' => $faculty->courses_teaching ?? null,
            'research_areas' => $faculty->research_areas ?? null,
            'expertise' => $faculty->expertise ?? null,
            'achievements' => $faculty->achievements ?? null,
        ]);
    }

    public function updateMe(Request $request)
    {
        logger()->info('FacultyController@updateMe called', ['data' => $request->all()]);
        
        $token = $this->tokenFrom($request);
        if (!$token) {
            logger()->warning('No token found in request');
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        logger()->info('Token received', ['token' => substr($token, 0, 10) . '...']);
        
        $faculty = Faculty::where('token', $token)->first();
        if (!$faculty) {
            logger()->warning('Faculty not found for token');
            // Check if using static config token
            if ($token === config('faculty.token')) {
                // For static token users, we can't persist changes to database
                // Return success but indicate it's read-only
                return response()->json([
                    'message' => 'Profile is read-only for static token users. Please create a proper account to save changes.',
                ], 403);
            }
            return response()->json(['message' => 'Not found'], 404);
        }

        logger()->info('Faculty found', ['id' => $faculty->id, 'username' => $faculty->username]);

        $data = $request->only([
            'first_name',
            'last_name',
            'middle_name',
            'employee_id',
            'email',
            'profile_picture',
            'position',
            'department',
            'bio',
            'office_location',
            'phone',
            'office_hours',
            'years_experience',
            'at_university_since',
            'publications',
            'courses_teaching',
            'research_areas',
            'expertise',
            'achievements'
        ]);
        // simple validation
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return response()->json(['message' => 'Invalid email'], 422);
        }
        $faculty->update($data);

        logger()->info('Faculty updated successfully', ['updated_data' => $data]);

        return response()->json(['message' => 'Updated', 'faculty' => [
            'username' => $faculty->username,
            'first_name' => $faculty->first_name,
            'last_name' => $faculty->last_name,
            'middle_name' => $faculty->middle_name,
            'employee_id' => $faculty->employee_id,
            'email' => $faculty->email,
            'profile_picture' => $faculty->profile_picture,
            'position' => $faculty->position,
            'department' => $faculty->department,
            'bio' => $faculty->bio,
            'office_location' => $faculty->office_location,
            'phone' => $faculty->phone,
            'office_hours' => $faculty->office_hours,
            'years_experience' => $faculty->years_experience,
            'at_university_since' => $faculty->at_university_since,
            'publications' => $faculty->publications,
            'courses_teaching' => $faculty->courses_teaching,
            'research_areas' => $faculty->research_areas,
            'expertise' => $faculty->expertise,
            'achievements' => $faculty->achievements,
        ]]);
    }
}
