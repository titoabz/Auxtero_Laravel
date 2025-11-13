<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\Faculty;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $u = $request->input('user');
        $p = $request->input('pass');

        // Debug logging
        logger()->info('Login attempt', ['username' => $u]);

        // First try local faculties table — accept username, email username, or employee ID
        $faculty = Faculty::where('username', $u)
            ->orWhere('email', $u)
            ->orWhere('employee_id', $u)
            ->first();
        
        // Debug logging
        if ($faculty) {
            logger()->info('Found faculty record', ['username' => $u]);
        } else {
            logger()->info('No faculty record found', ['username' => $u]);
        }

        if ($faculty && Hash::check($p, $faculty->password)) {
            logger()->info('Password check passed', ['username' => $u]);
            // ensure token exists
            if (!$faculty->token) {
                $faculty->token = Str::random(40);
                $faculty->save();
            }
            // Try to get a display name from a linked user record (created at signup)
            $displayFirst = null;
            $email = $faculty->username . '@faculty.local';
            $userRecord = User::where('email', $email)->first();
            if ($userRecord && !empty($userRecord->name)) {
                // extract first name only from the stored full name
                $parts = preg_split('/[\.\s_@\-]+/', trim($userRecord->name));
                $first = $parts[0] ?? $userRecord->name;
                $displayFirst = ucfirst(strtolower($first));
            } else {
                // fallback: derive a friendly first name from the username
                $parts = preg_split('/[\.\s_@\-]+/', $faculty->username);
                $first = $parts[0] ?? $faculty->username;
                $displayFirst = ucfirst(strtolower($first));
            }

            return response()->json(['token' => $faculty->token, 'name' => $displayFirst]);
        } else if ($faculty) {
            logger()->info('Password check failed', ['username' => $u]);
        }

        // Fallback to config (legacy/demo)
        $user = config('faculty.user');
        $pass = config('faculty.pass');
        logger()->info('Checking against config', ['config_user' => $user]);
        if ($u === $user && $p === $pass) {
            // derive a display name from the configured username
            $parts = preg_split('/[\.\s_@\-]+/', $user);
            $first = $parts[0] ?? $user;
            $display = ucfirst(strtolower($first));
            return response()->json(['token' => config('faculty.token'), 'name' => $display]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function signup(Request $request)
    {
        $u = $request->input('user');
        $p = $request->input('pass');

        if (!$u || !$p) {
            return response()->json(['message' => 'User and pass required'], 422);
        }

        if (Faculty::where('username', $u)->exists()) {
            return response()->json(['message' => 'User already exists'], 409);
        }

        try {
            \DB::beginTransaction();
            
            // Create both records with the same hashed password
            $token = Str::random(40);
            $hashedPassword = Hash::make($p);
            
            // Create faculty record directly to ensure it works
            $faculty = new Faculty();
            $faculty->username = $u;
            $faculty->password = $hashedPassword;
            $faculty->token = $token;
            // optional extra fields sent from frontend
            $faculty->first_name = $request->input('first_name');
            $faculty->last_name = $request->input('last_name');
            $faculty->middle_name = $request->input('middle_name');
            $faculty->employee_id = $request->input('employee_id');
            // set email if frontend provided an email username or else use username@faculty.local
            $providedEmail = $request->input('email');
            $faculty->email = $providedEmail ? $providedEmail : ($u . '@faculty.local');
            $faculty->save();
            
            logger()->info('Created faculty record', ['username' => $u]);
            
            // Create user record
            $email = $u . '@faculty.local';
            $attempt = 0;
            while (User::where('email', $email)->exists() && $attempt < 10) {
                $email = $u . '+' . Str::random(4) . '@faculty.local';
                $attempt++;
            }
            
            // Build a nicer display name for the user record (full name if provided)
            $first = $request->input('first_name');
            $last = $request->input('last_name');
            $displayName = $u;
            if ($first || $last) {
                $displayName = trim(($first ?? '') . ' ' . ($last ?? ''));
            }

            User::create([
                'name' => $displayName,
                'email' => $email,
                'password' => $hashedPassword
            ]);
            
            logger()->info('Created user record', ['email' => $email]);
            
            \DB::commit();
            // Return first name only for frontend greeting; prefer provided first name when available
            $firstForReturn = $first ?: preg_split('/[\.\s_@\-]+/', $u)[0] ?? $u;
            $firstForReturn = ucfirst(strtolower($firstForReturn));
            return response()->json(['token' => $token, 'name' => $firstForReturn]);
            
        } catch (\Exception $e) {
            \DB::rollBack();
            logger()->error('Signup failed', [
                'error' => $e->getMessage(),
                'username' => $u
            ]);
            return response()->json(['message' => 'Signup failed: ' . $e->getMessage()], 500);
        }
    }
}
