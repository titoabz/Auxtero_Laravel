<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Faculty;

class FacultyAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Change these entries to match real faculty data as needed
        $faculties = [
            [
                'name' => 'Dr. Alice Torres',
                'email' => 'alice.torres@example.edu',
                'username' => 'atorres',
                'password' => 'Password123!',
            ],
            [
                'name' => 'Prof. Ben Cruz',
                'email' => 'ben.cruz@example.edu',
                'username' => 'bcruz',
                'password' => 'Password123!',
            ],
        ];

        foreach ($faculties as $f) {
            // Create or update the regular user record (for systems that use the users table)
            $user = User::updateOrCreate(
                ['email' => $f['email']],
                [
                    'name' => $f['name'],
                    'password' => Hash::make($f['password']),
                ]
            );

            // Create or update the faculty-specific record (for faculty portal auth)
            $faculty = Faculty::updateOrCreate(
                ['username' => $f['username']],
                [
                    // store hashed password for security
                    'password' => Hash::make($f['password']),
                    'token' => Str::random(60),
                ]
            );

            // Optionally attach relationships here if you have FK columns linking
            // users <-> faculties. This project currently stores faculty separately.
        }
    }
}
