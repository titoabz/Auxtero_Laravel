<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldsToProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('profiles', 'first_name')) {
                $table->string('first_name')->nullable()->after('fname');
            }
            if (!Schema::hasColumn('profiles', 'last_name')) {
                $table->string('last_name')->nullable()->after('first_name');
            }
            if (!Schema::hasColumn('profiles', 'middle_name')) {
                $table->string('middle_name')->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('profiles', 'student_id')) {
                $table->string('student_id')->nullable()->after('middle_name');
            }
            if (!Schema::hasColumn('profiles', 'email')) {
                $table->string('email')->nullable()->after('student_id');
            }
            if (!Schema::hasColumn('profiles', 'gpa')) {
                $table->decimal('gpa', 3, 2)->nullable()->after('email');
            }
            if (!Schema::hasColumn('profiles', 'attendance')) {
                $table->integer('attendance')->nullable()->after('gpa');
            }
            if (!Schema::hasColumn('profiles', 'at_risk')) {
                $table->boolean('at_risk')->default(false)->after('attendance');
            }
            if (!Schema::hasColumn('profiles', 'active')) {
                $table->boolean('active')->default(true)->after('at_risk');
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
            $cols = ['first_name','last_name','middle_name','student_id','email','gpa','attendance','at_risk','active'];
            foreach ($cols as $c) {
                if (Schema::hasColumn('profiles', $c)) {
                    $table->dropColumn($c);
                }
            }
        });
    }
}
