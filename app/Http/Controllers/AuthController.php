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

        // First try local faculties table
        $faculty = Faculty::where('username', $u)->first();
        
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
            return response()->json(['token' => $faculty->token]);
        } else if ($faculty) {
            logger()->info('Password check failed', ['username' => $u]);
        }

        // Fallback to config (legacy/demo)
        $user = config('faculty.user');
        $pass = config('faculty.pass');
        logger()->info('Checking against config', ['config_user' => $user]);
        if ($u === $user && $p === $pass) {
            return response()->json(['token' => config('faculty.token')]);
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
            $faculty->save();
            
            logger()->info('Created faculty record', ['username' => $u]);
            
            // Create user record
            $email = $u . '@faculty.local';
            $attempt = 0;
            while (User::where('email', $email)->exists() && $attempt < 10) {
                $email = $u . '+' . Str::random(4) . '@faculty.local';
                $attempt++;
            }
            
            User::create([
                'name' => $u,
                'email' => $email,
                'password' => $hashedPassword
            ]);
            
            logger()->info('Created user record', ['email' => $email]);
            
            \DB::commit();
            return response()->json(['token' => $token]);
            
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
