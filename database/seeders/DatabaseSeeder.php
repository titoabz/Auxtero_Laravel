<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();
        // Seed sample faculty accounts (creates entries in both users and faculties tables)
        $this->call(\Database\Seeders\FacultyAccountsSeeder::class);
    }
}
