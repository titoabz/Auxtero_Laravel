<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\Faculty;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $u = $request->input('user');
        $p = $request->input('pass');

        // First try local faculties table
        $faculty = Faculty::where('username', $u)->first();
        if ($faculty && Hash::check($p, $faculty->password)) {
            // ensure token exists
            if (!$faculty->token) {
                $faculty->token = Str::random(40);
                $faculty->save();
            }
            return response()->json(['token' => $faculty->token]);
        }

        // Fallback to config (legacy/demo)
        $user = config('faculty.user');
        $pass = config('faculty.pass');
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

        $token = Str::random(40);
        $faculty = Faculty::create([
            'username' => $u,
            'password' => Hash::make($p),
            'token' => $token,
        ]);

        return response()->json(['token' => $token]);
    }
}
