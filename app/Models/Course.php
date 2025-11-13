<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'schedule',
        'status'
    ];

    public function sections()
    {
        return $this->hasMany(CourseSection::class);
    }
}
