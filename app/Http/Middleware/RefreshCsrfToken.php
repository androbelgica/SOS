<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RefreshCsrfToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if token is about to expire (e.g., less than 5 minutes remaining)
        $tokenExpiration = $request->session()->get('_token_expiration');

        if (!$tokenExpiration || time() > ($tokenExpiration - 300)) {
            // Generate new token
            $token = $request->session()->token();

            // Set expiration time (2 hours from now)
            $request->session()->put('_token_expiration', time() + 7200);

            // Add token to response headers for JavaScript to pick up
            $response = $next($request);
            $response->headers->set('X-CSRF-TOKEN', $token);

            return $response;
        }

        return $next($request);
    }
}
