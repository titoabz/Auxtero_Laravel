<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Faculty;

class CheckFacultyToken
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('X-Portal-Auth') ?: $request->bearerToken();

        // Accept either the configured static token OR any token issued to a local faculty account
        $static = config('faculty.token');
        $ok = false;
        if ($header && $header === $static) $ok = true;
        if ($header && Faculty::where('token', $header)->exists()) $ok = true;

        if (!$ok) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
