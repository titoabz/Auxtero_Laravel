<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddProfilePictures extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Add profile_picture to faculties table
        Schema::table('faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('faculties', 'profile_picture')) {
                $table->string('profile_picture')->nullable()->after('email');
            }
        });

        // Add profile_picture to profiles (students) table
        Schema::table('profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('profiles', 'profile_picture')) {
                $table->string('profile_picture')->nullable()->after('email');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('faculties', function (Blueprint $table) {
            if (Schema::hasColumn('faculties', 'profile_picture')) {
                $table->dropColumn('profile_picture');
            }
        });

        Schema::table('profiles', function (Blueprint $table) {
            if (Schema::hasColumn('profiles', 'profile_picture')) {
                $table->dropColumn('profile_picture');
            }
        });
    }
}
