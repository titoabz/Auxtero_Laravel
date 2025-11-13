<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SectionStudent extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_id',
        'student_id',
        'name',
        'email',
        'profile_picture',
        'attendance',
        'grade',
        'grade_percentage',
        'present',
        'absent',
        'late',
        'total_classes',
        'active',
        'at_risk'
    ];

    public function section()
    {
        return $this->belongsTo(CourseSection::class, 'section_id');
    }
}
