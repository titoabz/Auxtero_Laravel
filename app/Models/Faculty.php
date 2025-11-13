<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    protected $table = 'faculties';
    
    protected $fillable = [
        'username',
        'password',
        'token',
        'first_name',
        'last_name',
        'middle_name',
        'employee_id',
        'email',
        'profile_picture',
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
    ];
    
    protected $hidden = [
        'password'
    ];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    // Ensure password is always hashed
    public function setPasswordAttribute($value)
    {
        if ($value && !str_starts_with($value, '$2y$')) {
            $this->attributes['password'] = \Hash::make($value);
        } else {
            $this->attributes['password'] = $value;
        }
    }
}
