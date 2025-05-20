<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Upload an image file to storage
     */
    public function uploadImage(UploadedFile $file, string $folder = 'uploads'): string
    {
        // Generate a unique filename with timestamp to prevent caching issues
        $filename = Str::uuid() . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Ensure the directory exists
        $storageDirectory = "public/{$folder}";
        if (!Storage::exists($storageDirectory)) {
            Storage::makeDirectory($storageDirectory);
        }

        // Store the file
        $path = $file->storeAs($storageDirectory, $filename);

        // Get the URL as a relative path
        $url = Storage::url($path);

        // Ensure it's a relative path by removing any domain
        if (str_starts_with($url, 'http')) {
            $parsedUrl = parse_url($url);
            $url = $parsedUrl['path'];
        }

        // Log the URL for debugging
        \Log::info('Generated image URL', [
            'storage_url' => Storage::url($path),
            'final_url' => $url,
            'path' => $path,
            'absolute_path' => storage_path('app/' . $path),
            'public_path' => public_path('storage/' . str_replace('public/', '', $path))
        ]);

        // Verify the file was actually stored
        if (!Storage::exists($path)) {
            \Log::error('File upload failed - file does not exist at path', [
                'original_name' => $file->getClientOriginalName(),
                'stored_path' => $path,
                'url' => $url,
                'absolute_path' => storage_path('app/' . $path),
                'public_path' => public_path('storage/' . str_replace('public/', '', $path))
            ]);
            throw new \Exception("Failed to store file at path: {$path}");
        }

        // Check if the file is accessible via the public URL
        $publicPath = public_path('storage/' . str_replace('public/', '', $path));
        $fileIsAccessible = file_exists($publicPath);

        // Log the file path for debugging
        \Log::info('File uploaded successfully', [
            'original_name' => $file->getClientOriginalName(),
            'stored_path' => $path,
            'url' => $url,
            'absolute_path' => storage_path('app/' . $path),
            'public_path' => $publicPath,
            'file_exists_in_storage' => Storage::exists($path),
            'file_exists_in_public' => $fileIsAccessible,
            'file_size' => Storage::size($path)
        ]);

        return $url;
    }

    /**
     * Delete an image file from storage
     */
    public function deleteImage(?string $url): bool
    {
        if (!$url) {
            \Log::info('No URL provided for image deletion');
            return false;
        }

        // Extract the path from the URL
        $storagePath = str_replace('/storage/', 'public/', $url);

        // Get the public path
        $publicPath = public_path(str_replace('/storage/', 'storage/', $url));

        // Remove any query parameters
        if (strpos($storagePath, '?') !== false) {
            $storagePath = substr($storagePath, 0, strpos($storagePath, '?'));
        }

        if (strpos($publicPath, '?') !== false) {
            $publicPath = substr($publicPath, 0, strpos($publicPath, '?'));
        }

        // Log the attempt
        \Log::info('Attempting to delete image', [
            'url' => $url,
            'storage_path' => $storagePath,
            'public_path' => $publicPath,
            'storage_exists' => Storage::exists($storagePath),
            'public_exists' => file_exists($publicPath)
        ]);

        $success = false;

        // Delete from storage
        if (Storage::exists($storagePath)) {
            Storage::delete($storagePath);
            $success = true;
        }

        // Also delete from public directory
        if (file_exists($publicPath)) {
            unlink($publicPath);
            $success = true;
        }

        \Log::info('Image deletion result', ['success' => $success]);
        return $success;
    }

    /**
     * Upload a video file to storage
     */
    public function uploadVideo(UploadedFile $file, string $folder = 'videos'): string
    {
        // Generate a unique filename with timestamp to prevent caching issues
        $filename = Str::uuid() . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Ensure the directory exists
        $storageDirectory = "public/{$folder}";
        if (!Storage::exists($storageDirectory)) {
            Storage::makeDirectory($storageDirectory);
        }

        // Store the file
        $path = $file->storeAs($storageDirectory, $filename);

        // Get the URL as a relative path
        $url = Storage::url($path);

        // Ensure it's a relative path by removing any domain
        if (str_starts_with($url, 'http')) {
            $parsedUrl = parse_url($url);
            $url = $parsedUrl['path'];
        }

        // Log the URL for debugging
        \Log::info('Generated video URL', [
            'storage_url' => Storage::url($path),
            'final_url' => $url,
            'path' => $path,
            'absolute_path' => storage_path('app/' . $path),
            'public_path' => public_path('storage/' . str_replace('public/', '', $path))
        ]);

        // Verify the file was actually stored
        if (!Storage::exists($path)) {
            \Log::error('Video upload failed - file does not exist at path', [
                'original_name' => $file->getClientOriginalName(),
                'stored_path' => $path,
                'url' => $url,
                'absolute_path' => storage_path('app/' . $path),
                'public_path' => public_path('storage/' . str_replace('public/', '', $path))
            ]);
            throw new \Exception("Failed to store video file at path: {$path}");
        }

        // Check if the file is accessible via the public URL
        $publicPath = public_path('storage/' . str_replace('public/', '', $path));
        $fileIsAccessible = file_exists($publicPath);

        // Log the file path for debugging
        \Log::info('Video uploaded successfully', [
            'original_name' => $file->getClientOriginalName(),
            'stored_path' => $path,
            'url' => $url,
            'absolute_path' => storage_path('app/' . $path),
            'public_path' => $publicPath,
            'file_exists_in_storage' => Storage::exists($path),
            'file_exists_in_public' => $fileIsAccessible,
            'file_size' => Storage::size($path)
        ]);

        return $url;
    }

    /**
     * Delete a video file from storage
     */
    public function deleteVideo(?string $url): bool
    {
        if (!$url) {
            \Log::info('No URL provided for video deletion');
            return false;
        }

        // Extract the path from the URL
        $storagePath = str_replace('/storage/', 'public/', $url);

        // Get the public path
        $publicPath = public_path(str_replace('/storage/', 'storage/', $url));

        // Remove any query parameters
        if (strpos($storagePath, '?') !== false) {
            $storagePath = substr($storagePath, 0, strpos($storagePath, '?'));
        }

        if (strpos($publicPath, '?') !== false) {
            $publicPath = substr($publicPath, 0, strpos($publicPath, '?'));
        }

        // Log the attempt
        \Log::info('Attempting to delete video', [
            'url' => $url,
            'storage_path' => $storagePath,
            'public_path' => $publicPath,
            'storage_exists' => Storage::exists($storagePath),
            'public_exists' => file_exists($publicPath)
        ]);

        $success = false;

        // Delete from storage
        if (Storage::exists($storagePath)) {
            Storage::delete($storagePath);
            $success = true;
        }

        // Also delete from public directory
        if (file_exists($publicPath)) {
            unlink($publicPath);
            $success = true;
        }

        \Log::info('Video deletion result', ['success' => $success]);
        return $success;
    }
}
