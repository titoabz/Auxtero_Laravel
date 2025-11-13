<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourseSection;
use App\Models\SectionStudent;
use Illuminate\Http\Request;

class SectionStudentController extends Controller
{
    /**
     * Display all students across all courses and sections.
     */
    public function all()
    {
        $students = SectionStudent::with(['section.course'])
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'student_id' => $student->student_id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'profile_picture' => $student->profile_picture,
                    'attendance' => $student->attendance,
                    'grade' => $student->grade,
                    'grade_percentage' => $student->grade_percentage,
                    'present' => $student->present,
                    'absent' => $student->absent,
                    'late' => $student->late,
                    'total_classes' => $student->total_classes,
                    'active' => $student->active ?? true,
                    'at_risk' => $student->at_risk ?? false,
                    'course_name' => $student->section->course->name ?? null,
                    'course_code' => $student->section->course->code ?? null,
                    'section_name' => $student->section->name ?? null,
                ];
            });

        return response()->json($students);
    }

    /**
     * Get a single student by ID.
     */
    public function getStudent($id)
    {
        $student = SectionStudent::with(['section.course'])->findOrFail($id);
        
        return response()->json([
            'id' => $student->id,
            'student_id' => $student->student_id,
            'name' => $student->name,
            'email' => $student->email,
            'profile_picture' => $student->profile_picture,
            'attendance' => $student->attendance,
            'grade' => $student->grade,
            'grade_percentage' => $student->grade_percentage,
            'present' => $student->present,
            'absent' => $student->absent,
            'late' => $student->late,
            'total_classes' => $student->total_classes,
            'active' => $student->active ?? true,
            'at_risk' => $student->at_risk ?? false,
            'course_name' => $student->section->course->name ?? null,
            'course_code' => $student->section->course->code ?? null,
            'section_name' => $student->section->name ?? null,
            'section_id' => $student->section_id ?? null,
        ]);
    }

    /**
     * Display a listing of students in a section.
     */
    public function index($courseId, $sectionId)
    {
        $section = CourseSection::where('course_id', $courseId)
            ->findOrFail($sectionId);
        
        $students = $section->students;
        
        return response()->json($students);
    }

    /**
     * Store a newly created student in a section.
     */
    public function store(Request $request, $courseId, $sectionId)
    {
        $section = CourseSection::where('course_id', $courseId)
            ->findOrFail($sectionId);

        $validated = $request->validate([
            'student_id' => 'required|string',
            'name' => 'required|string',
            'email' => 'required|email',
            'attendance' => 'nullable|integer|min:0|max:100',
            'grade' => 'nullable|string',
            'grade_percentage' => 'nullable|integer|min:0|max:100',
            'present' => 'nullable|integer|min:0',
            'absent' => 'nullable|integer|min:0',
            'late' => 'nullable|integer|min:0',
            'total_classes' => 'nullable|integer|min:0'
        ]);

        // Set default values
        $validated['attendance'] = $validated['attendance'] ?? 0;
        $validated['grade_percentage'] = $validated['grade_percentage'] ?? 0;
        $validated['present'] = $validated['present'] ?? 0;
        $validated['absent'] = $validated['absent'] ?? 0;
        $validated['late'] = $validated['late'] ?? 0;
        $validated['total_classes'] = $validated['total_classes'] ?? 0;

        $student = $section->students()->create($validated);

        return response()->json($student, 201);
    }

    /**
     * Display the specified student.
     */
    public function show($courseId, $sectionId, $id)
    {
        $student = SectionStudent::where('section_id', $sectionId)
            ->findOrFail($id);

        return response()->json($student);
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, $courseId, $sectionId, $id)
    {
        $student = SectionStudent::where('section_id', $sectionId)
            ->findOrFail($id);

        $validated = $request->validate([
            'student_id' => 'required|string',
            'name' => 'required|string',
            'email' => 'required|email',
            'attendance' => 'nullable|integer|min:0|max:100',
            'grade' => 'nullable|string',
            'grade_percentage' => 'nullable|integer|min:0|max:100',
            'present' => 'nullable|integer|min:0',
            'absent' => 'nullable|integer|min:0',
            'late' => 'nullable|integer|min:0',
            'total_classes' => 'nullable|integer|min:0'
        ]);

        $student->update($validated);

        return response()->json($student);
    }

    /**
     * Update student status (for general student management).
     */
    public function updateStatus(Request $request, $id)
    {
        $student = SectionStudent::findOrFail($id);

        $validated = $request->validate([
            'active' => 'nullable|boolean',
            'at_risk' => 'nullable|boolean',
        ]);

        $student->update($validated);

        return response()->json($student);
    }

    /**
     * Update a student by ID (for general student management).
     */
    public function updateStudent(Request $request, $id)
    {
        $student = SectionStudent::findOrFail($id);

        $validated = $request->validate([
            'student_id' => 'nullable|string',
            'name' => 'nullable|string',
            'email' => 'nullable|email',
            'attendance' => 'nullable|integer|min:0|max:100',
            'grade' => 'nullable|string',
            'grade_percentage' => 'nullable|numeric|min:0|max:100',
            'present' => 'nullable|integer|min:0',
            'absent' => 'nullable|integer|min:0',
            'late' => 'nullable|integer|min:0',
            'total_classes' => 'nullable|integer|min:0',
            'profile_picture' => 'nullable|string',
        ]);

        $student->update($validated);

        return response()->json($student);
    }

    /**
     * Delete a student by ID (for general student management).
     */
    public function deleteStudent($id)
    {
        $student = SectionStudent::findOrFail($id);
        $student->delete();

        return response()->json(['message' => 'Student deleted successfully']);
    }

    /**
     * Upload profile picture for a student.
     */
    public function uploadProfilePicture(Request $request, $id)
    {
        $student = SectionStudent::findOrFail($id);

        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
            if ($student->profile_picture && file_exists(public_path($student->profile_picture))) {
                unlink(public_path($student->profile_picture));
            }

            $file = $request->file('profile_picture');
            $filename = 'student_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/students'), $filename);
            
            $student->profile_picture = '/uploads/students/' . $filename;
            $student->save();
        }

        return response()->json([
            'message' => 'Profile picture uploaded successfully',
            'profile_picture' => $student->profile_picture
        ]);
    }

    /**
     * Delete profile picture for a student.
     */
    public function deleteProfilePicture($id)
    {
        $student = SectionStudent::findOrFail($id);

        if ($student->profile_picture) {
            // Delete the file if it exists
            if (file_exists(public_path($student->profile_picture))) {
                unlink(public_path($student->profile_picture));
            }

            // Clear the profile_picture field
            $student->profile_picture = null;
            $student->save();
        }

        return response()->json([
            'message' => 'Profile picture deleted successfully'
        ]);
    }

    /**
     * Remove the specified student.
     */
    public function destroy($courseId, $sectionId, $id)
    {
        $student = SectionStudent::where('section_id', $sectionId)
            ->findOrFail($id);

        $student->delete();

        return response()->json(['message' => 'Student removed successfully']);
    }
}
