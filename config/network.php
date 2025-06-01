<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Network Configuration for Mobile App
    |--------------------------------------------------------------------------
    |
    | This configuration file contains network-related settings specifically
    | for mobile app connectivity and API access.
    |
    */

    'mobile_api' => [
        'allowed_origins' => [
            'http://localhost:8081',
            'http://127.0.0.1:8081',
            'http://192.168.218.109:8081',
            'exp://192.168.218.109:8081',
            'exp://localhost:8081',
        ],

        'allowed_headers' => [
            'Accept',
            'Authorization',
            'Content-Type',
            'X-Requested-With',
            'X-CSRF-TOKEN',
        ],

        'allowed_methods' => [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'OPTIONS',
        ],
    ],

    'server' => [
        'host' => env('SERVER_HOST', '0.0.0.0'),
        'port' => env('SERVER_PORT', 8000),
        'timeout' => env('SERVER_TIMEOUT', 30),
    ],

    'debug' => [
        'log_requests' => env('LOG_API_REQUESTS', false),
        'log_responses' => env('LOG_API_RESPONSES', false),
        'show_network_info' => env('SHOW_NETWORK_INFO', true),
    ],

];
