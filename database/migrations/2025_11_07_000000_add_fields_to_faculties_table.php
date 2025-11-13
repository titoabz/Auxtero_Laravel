<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Add personal fields for faculty accounts
            $table->string('first_name')->nullable()->after('username');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('middle_name')->nullable()->after('last_name');
            $table->string('employee_id')->nullable()->after('middle_name');
            $table->string('email')->nullable()->after('employee_id');
        });
    }

    public function down()
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn(['first_name','last_name','middle_name','employee_id','email']);
        });
    }
};
