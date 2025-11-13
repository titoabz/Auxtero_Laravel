<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Upload an image and return the path
     * Accepts: base64 encoded image or file upload
     */
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required',
            'type' => 'required|in:faculty,student'
        ]);

        $type = $request->input('type');
        $image = $request->input('image');

        try {
            // Handle base64 encoded image
            if (strpos($image, 'data:image') === 0) {
                // Extract base64 data
                $imageData = explode(',', $image);
                $imageBase64 = end($imageData);
                $decodedImage = base64_decode($imageBase64);
                
                // Determine file extension from mime type
                preg_match('/data:image\/(.*?);/', $image, $matches);
                $extension = $matches[1] ?? 'png';
                
                // Generate unique filename
                $filename = Str::random(40) . '.' . $extension;
                $path = 'profile_pictures/' . $type . '/' . $filename;
                
                // Store in public disk
                Storage::disk('public')->put($path, $decodedImage);
                
                return response()->json([
                    'success' => true,
                    'path' => '/storage/' . $path
                ]);
            }
            
            // Handle file upload
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('profile_pictures/' . $type, $filename, 'public');
                
                return response()->json([
                    'success' => true,
                    'path' => '/storage/' . $path
                ]);
            }
            
            return response()->json(['success' => false, 'message' => 'No valid image provided'], 400);
            
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
