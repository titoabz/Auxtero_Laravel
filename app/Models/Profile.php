<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;
    protected $fillable = [
        'fname', 'lname',
        'first_name', 'last_name', 'middle_name',
        'student_id', 'email', 'gpa', 'attendance',
        'at_risk', 'active', 'profile_picture'
    ];
}
