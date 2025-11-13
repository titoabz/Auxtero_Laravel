<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusFieldsToSectionStudentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('section_students', function (Blueprint $table) {
            $table->boolean('active')->default(true)->after('total_classes');
            $table->boolean('at_risk')->default(false)->after('active');
            $table->string('profile_picture')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('section_students', function (Blueprint $table) {
            $table->dropColumn(['active', 'at_risk', 'profile_picture']);
        });
    }
}
