<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use App\Models\Profile;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        // simple listing - could add pagination/filters later
        $profiles = Profile::orderBy('last_name')->get();
        return response()->json($profiles);
    }

    public function show(Profile $profile)
    {
        return response()->json($profile);
    }

    public function store(Request $request)
    {
        $data = $request->only([
            'first_name','last_name','middle_name','student_id','email','gpa','attendance','at_risk','active','fname','lname','profile_picture'
        ]);

        // allow legacy fname/lname
        if (empty($data['first_name']) && !empty($data['fname'])) {
            $data['first_name'] = $data['fname'];
        }
        if (empty($data['last_name']) && !empty($data['lname'])) {
            $data['last_name'] = $data['lname'];
        }

        // normalize numeric fields
        if (isset($data['gpa'])) {
            $data['gpa'] = $data['gpa'] === null ? null : floatval($data['gpa']);
        }
        if (isset($data['attendance'])) {
            $data['attendance'] = $data['attendance'] === null ? null : intval($data['attendance']);
        }

        // Map incoming fields to actual DB columns that exist.
        $toSave = [];
        // Bidirectional sync: populate both new and legacy name columns
        if (!empty($data['first_name'])) {
            if (Schema::hasColumn('profiles', 'first_name')) {
                $toSave['first_name'] = $data['first_name'];
            }
            if (Schema::hasColumn('profiles', 'fname')) {
                $toSave['fname'] = $data['first_name']; // sync to legacy
            }
        } elseif (!empty($data['fname'])) {
            if (Schema::hasColumn('profiles', 'fname')) {
                $toSave['fname'] = $data['fname'];
            }
            if (Schema::hasColumn('profiles', 'first_name')) {
                $toSave['first_name'] = $data['fname']; // sync to new
            }
        }

        if (!empty($data['last_name'])) {
            if (Schema::hasColumn('profiles', 'last_name')) {
                $toSave['last_name'] = $data['last_name'];
            }
            if (Schema::hasColumn('profiles', 'lname')) {
                $toSave['lname'] = $data['last_name']; // sync to legacy
            }
        } elseif (!empty($data['lname'])) {
            if (Schema::hasColumn('profiles', 'lname')) {
                $toSave['lname'] = $data['lname'];
            }
            if (Schema::hasColumn('profiles', 'last_name')) {
                $toSave['last_name'] = $data['lname']; // sync to new
            }
        }

        // Other fields: only add if the column exists
        $other = ['middle_name','student_id','email','gpa','attendance','at_risk','active','profile_picture'];
        foreach ($other as $col) {
            if (isset($data[$col])) {
                if (Schema::hasColumn('profiles', $col)) {
                    $toSave[$col] = $data[$col];
                }
            }
        }

        // Create using only existing columns to avoid SQL errors
        $profile = Profile::create($toSave);
        return response()->json($profile, 201);
    }

    public function update(Request $request, Profile $profile)
    {
        $data = $request->only([
            'first_name','last_name','middle_name','student_id','email','gpa','attendance','at_risk','active','fname','lname','profile_picture'
        ]);

        if (isset($data['gpa'])) $data['gpa'] = $data['gpa'] === null ? null : floatval($data['gpa']);
        if (isset($data['attendance'])) $data['attendance'] = $data['attendance'] === null ? null : intval($data['attendance']);

        // Build update payload using only existing columns (and map legacy names)
        $toSave = [];
        // Bidirectional sync for updates
        if (isset($data['first_name'])) {
            if (Schema::hasColumn('profiles', 'first_name')) {
                $toSave['first_name'] = $data['first_name'];
            }
            if (Schema::hasColumn('profiles', 'fname')) {
                $toSave['fname'] = $data['first_name']; // sync to legacy
            }
        } elseif (isset($data['fname'])) {
            if (Schema::hasColumn('profiles', 'fname')) {
                $toSave['fname'] = $data['fname'];
            }
            if (Schema::hasColumn('profiles', 'first_name')) {
                $toSave['first_name'] = $data['fname']; // sync to new
            }
        }

        if (isset($data['last_name'])) {
            if (Schema::hasColumn('profiles', 'last_name')) {
                $toSave['last_name'] = $data['last_name'];
            }
            if (Schema::hasColumn('profiles', 'lname')) {
                $toSave['lname'] = $data['last_name']; // sync to legacy
            }
        } elseif (isset($data['lname'])) {
            if (Schema::hasColumn('profiles', 'lname')) {
                $toSave['lname'] = $data['lname'];
            }
            if (Schema::hasColumn('profiles', 'last_name')) {
                $toSave['last_name'] = $data['lname']; // sync to new
            }
        }

        $other = ['middle_name','student_id','email','gpa','attendance','at_risk','active','profile_picture'];
        foreach ($other as $col) {
            if (array_key_exists($col, $data) && Schema::hasColumn('profiles', $col)) {
                $toSave[$col] = $data[$col];
            }
        }

        $profile->update($toSave);
        return response()->json($profile);
    }

    public function destroy(Profile $profile)
    {
        $profile->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
