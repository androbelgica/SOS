<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use App\Policies\OrderPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share asset helper with all Inertia responses
        Inertia::share('asset', function (string $path = '') {
            return asset($path);
        });

        // Configure Vite prefetch
        if (class_exists(Vite::class)) {
            Vite::prefetch(concurrency: 3);
        }

        Gate::policy(\App\Models\Order::class, \App\Policies\OrderPolicy::class);
    }
}
