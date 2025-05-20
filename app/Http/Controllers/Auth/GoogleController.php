<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirectToGoogle()
    {
        // Check if Google OAuth is configured
        if (empty(config('services.google.client_id')) || empty(config('services.google.client_secret'))) {
            Log::error('Google OAuth not configured properly. Missing client ID or client secret.');
            return redirect()->route('login')->with('error', 'Google authentication is not configured properly. Please contact the administrator.');
        }

        // Log the configuration for debugging
        Log::info('Google OAuth Configuration', [
            'client_id' => config('services.google.client_id'),
            'redirect' => config('services.google.redirect'),
            'app_url' => config('app.url')
        ]);

        try {
            // Disable SSL verification in local environment
            if (app()->environment('local')) {
                Config::set('services.google.guzzle', [
                    'verify' => false,
                ]);
            }

            return Socialite::driver('google')->redirect();
        } catch (Exception $e) {
            Log::error('Google OAuth Redirect Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('login')->with('error', 'Failed to connect to Google. Please try again later.');
        }
    }

    /**
     * Obtain the user information from Google.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            // Check if there's an error parameter in the callback
            if ($request->has('error')) {
                Log::error('Google OAuth Error', [
                    'error' => $request->error,
                    'error_description' => $request->error_description ?? 'No description provided'
                ]);
                return redirect()->route('login')->with('error', 'Google authentication error: ' . ($request->error_description ?? $request->error));
            }

            // Disable SSL verification in local environment
            if (app()->environment('local')) {
                Config::set('services.google.guzzle', [
                    'verify' => false,
                ]);
            }

            // Get the user data from Google
            $googleUser = Socialite::driver('google')->user();

            // Log successful user retrieval
            Log::info('Google OAuth User Retrieved', [
                'id' => $googleUser->getId(),
                'email' => $googleUser->getEmail()
            ]);

            // Check if user already exists with this google_id
            $user = User::where('google_id', $googleUser->getId())->first();

            if (!$user) {
                // Check if email already exists
                $existingUser = User::where('email', $googleUser->getEmail())->first();

                if ($existingUser) {
                    // Update existing user with Google ID
                    $existingUser->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]);

                    $user = $existingUser;
                    Log::info('Existing user updated with Google ID', ['user_id' => $user->id]);
                } else {
                    // Create new user
                    $user = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                        'role' => 'customer',
                        'email_verified_at' => now(), // Google accounts are already verified
                    ]);
                    Log::info('New user created from Google login', ['user_id' => $user->id]);
                }
            } else {
                Log::info('Existing Google user logged in', ['user_id' => $user->id]);
            }

            // Login the user
            Auth::login($user);

            return redirect()->intended(route('dashboard', absolute: false));
        } catch (Exception $e) {
            Log::error('Google OAuth Callback Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('login')->with('error', 'Google login failed: ' . $e->getMessage());
        }
    }
}
