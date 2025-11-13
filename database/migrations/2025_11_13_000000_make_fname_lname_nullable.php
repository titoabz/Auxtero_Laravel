<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakeFnameLnameNullable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('profiles', function (Blueprint $table) {
            // Make legacy fname/lname columns nullable to prevent insert errors
            // when using new first_name/last_name columns
            if (Schema::hasColumn('profiles', 'fname')) {
                $table->string('fname')->nullable()->change();
            }
            if (Schema::hasColumn('profiles', 'lname')) {
                $table->string('lname')->nullable()->change();
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
        Schema::table('profiles', function (Blueprint $table) {
            if (Schema::hasColumn('profiles', 'fname')) {
                $table->string('fname')->nullable(false)->change();
            }
            if (Schema::hasColumn('profiles', 'lname')) {
                $table->string('lname')->nullable(false)->change();
            }
        });
    }
}
