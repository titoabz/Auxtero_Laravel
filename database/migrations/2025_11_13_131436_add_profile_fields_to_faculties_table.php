<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddProfileFieldsToFacultiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->string('position')->nullable()->after('email');
            $table->string('department')->nullable()->after('position');
            $table->text('bio')->nullable()->after('department');
            $table->string('office_location')->nullable()->after('bio');
            $table->string('phone')->nullable()->after('office_location');
            $table->string('office_hours')->nullable()->after('phone');
            $table->string('years_experience')->nullable()->after('office_hours');
            $table->string('at_university_since')->nullable()->after('years_experience');
            $table->string('publications')->nullable()->after('at_university_since');
            $table->string('courses_teaching')->nullable()->after('publications');
            $table->text('research_areas')->nullable()->after('courses_teaching');
            $table->text('expertise')->nullable()->after('research_areas');
            $table->text('achievements')->nullable()->after('expertise');
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
            $table->dropColumn([
                'position',
                'department',
                'bio',
                'office_location',
                'phone',
                'office_hours',
                'years_experience',
                'at_university_since',
                'publications',
                'courses_teaching',
                'research_areas',
                'expertise',
                'achievements'
            ]);
        });
    }
}
