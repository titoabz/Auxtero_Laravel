<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::orderBy('date')
            ->orderBy('time')
            ->get();
        return response()->json($events);
    }

    public function store(Request $request)
    {
        $data = $request->only(['title','date','time','type','description']);

        // Minimal validation
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'nullable|string|max:10',
            'type' => 'nullable|string|max:30',
            'description' => 'nullable|string',
        ]);

        // Defaults
        if (empty($data['type'])) $data['type'] = 'event';

        $event = Event::create($data);
        return response()->json($event, 201);
    }

    public function show(Event $event)
    {
        return response()->json($event);
    }

    public function update(Request $request, Event $event)
    {
        $data = $request->only(['title','date','time','type','description']);
        $event->update($data);
        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
