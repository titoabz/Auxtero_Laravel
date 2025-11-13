<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseSection;
use Illuminate\Http\Request;

class CourseSectionController extends Controller
{
    /**
     * Display a listing of sections for a course.
     *
     * @param  int  $courseId
     * @return \Illuminate\Http\Response
     */
    public function index($courseId)
    {
        $course = Course::findOrFail($courseId);
        $sections = $course->sections()->with('students')->get();
        return response()->json($sections);
    }

    /**
     * Store a newly created section in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $courseId
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $courseId)
    {
        $course = Course::findOrFail($courseId);
        
        $validated = $request->validate([
            'name' => 'required|string',
            'schedule' => 'required|string',
            'room' => 'required|string',
            'capacity' => 'required|integer|min:1'
        ]);

        $section = $course->sections()->create($validated);
        return response()->json($section->load('students'), 201);
    }

    /**
     * Display the specified section.
     *
     * @param  int  $courseId
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($courseId, $id)
    {
        $section = CourseSection::where('course_id', $courseId)
            ->with('students')
            ->findOrFail($id);
        return response()->json($section);
    }

    /**
     * Update the specified section in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $courseId
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $courseId, $id)
    {
        $section = CourseSection::where('course_id', $courseId)->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string',
            'schedule' => 'required|string',
            'room' => 'required|string',
            'capacity' => 'required|integer|min:1'
        ]);

        $section->update($validated);
        return response()->json($section->load('students'));
    }

    /**
     * Remove the specified section from storage.
     *
     * @param  int  $courseId
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($courseId, $id)
    {
        $section = CourseSection::where('course_id', $courseId)->findOrFail($id);
        $section->delete();
        return response()->json(['message' => 'Section deleted successfully']);
    }
}
