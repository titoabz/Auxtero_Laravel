<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSectionStudentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('section_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('course_sections')->onDelete('cascade');
            $table->string('student_id');
            $table->string('name');
            $table->string('email');
            $table->integer('attendance')->default(0);
            $table->string('grade')->nullable();
            $table->integer('grade_percentage')->default(0);
            $table->integer('present')->default(0);
            $table->integer('absent')->default(0);
            $table->integer('late')->default(0);
            $table->integer('total_classes')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('section_students');
    }
}
