<?php

return [
    // Faculty credentials for the simple SPA login (change in .env)
    'user' => env('FACULTY_USER', 'admin'),
    'pass' => env('FACULTY_PASS', 'password'),

    // Static token returned to the SPA after successful login. Change in .env for security.
    'token' => env('FACULTY_API_TOKEN', 'devtoken123'),
];
