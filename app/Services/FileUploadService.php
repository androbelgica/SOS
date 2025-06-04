<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Sanitize a string for use as a filename
     *
     * @param string $name The name to sanitize
     * @return string The sanitized name
     */
    private function sanitizeFilename(string $name): string
    {
        // Convert to lowercase
        $filename = strtolower($name);

        // Replace spaces with underscores
        $filename = str_replace(' ', '_', $filename);

        // Remove any characters that aren't alphanumeric, underscore, or hyphen
        $filename = preg_replace('/[^a-z0-9_-]/', '', $filename);

        // Ensure the filename isn't too long (max 50 chars)
        $filename = substr($filename, 0, 50);

        // If the filename is empty after sanitization, use a fallback
        if (empty($filename)) {
            $filename = 'file_' . time();
        }

        return $filename;
    }
    /**
     * Check if an image with the same name already exists in storage
     * This helps with image reusability when products/recipes are recreated
     */
    public function findExistingImage(string $originalName, string $folder = 'uploads'): ?string
    {
        // Clean the original filename to use for searching
        $cleanName = pathinfo($originalName, PATHINFO_FILENAME);
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);

        // Search in the storage directory for files with similar names
        $storageDirectory = $folder;
        $files = Storage::files($storageDirectory);

        // Log the search attempt
        Log::info('Searching for existing image', [
            'original_name' => $originalName,
            'clean_name' => $cleanName,
            'extension' => $extension,
            'folder' => $folder,
            'files_count' => count($files)
        ]);

        // Look for files that might match the original name pattern
        foreach ($files as $file) {
            $filename = basename($file);

            // If the filename contains the original name (case insensitive) and has the same extension
            if (
                stripos($filename, $cleanName) !== false &&
                pathinfo($filename, PATHINFO_EXTENSION) === $extension
            ) {

                // Get the URL as a relative path
                $url = Storage::url($file);

                // Ensure it's a relative path by removing any domain
                if (str_starts_with($url, 'http')) {
                    $parsedUrl = parse_url($url);
                    $url = $parsedUrl['path'];
                }

                Log::info('Found existing image', [
                    'original_name' => $originalName,
                    'found_file' => $filename,
                    'url' => $url
                ]);

                return $url;
            }
        }

        Log::info('No existing image found', [
            'original_name' => $originalName,
            'folder' => $folder
        ]);

        return null;
    }

    /**
     * Upload an image file to storage
     *
     * @param UploadedFile $file The uploaded file
     * @param string $folder The folder to store the file in
     * @param string|null $name The name to use for the file (product or recipe name)
     * @return string The URL of the uploaded file
     */
    public function uploadImage(UploadedFile $file, string $folder = 'uploads', ?string $name = null): string
    {
        // First check if a similar image already exists
        $existingImageUrl = $this->findExistingImage($file->getClientOriginalName(), $folder);
        if ($existingImageUrl) {
            Log::info('Using existing image instead of uploading new one', [
                'original_name' => $file->getClientOriginalName(),
                'existing_url' => $existingImageUrl
            ]);
            return $existingImageUrl;
        }

        // Generate a filename based on the name if provided
        if ($name) {
            // Sanitize the name for use as a filename
            $sanitizedName = $this->sanitizeFilename($name);
            $filename = $sanitizedName . '_' . time() . '.' . $file->getClientOriginalExtension();

            Log::info('Using product/recipe name for image filename', [
                'original_name' => $name,
                'sanitized_name' => $sanitizedName,
                'final_filename' => $filename
            ]);
        } else {
            // Fallback to the old method if no name is provided
            $filename = Str::uuid() . '_' . time() . '.' . $file->getClientOriginalExtension();
        }

        // Ensure the directory exists (don't add 'public/' prefix as Laravel's public disk already handles this)
        $storageDirectory = $folder;
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
        Log::info('Generated image URL', [
            'original_path' => $path,
            'final_url' => $url,
            'absolute_path' => storage_path('app/' . $path),
            'public_path' => public_path('storage/' . $url)
        ]);

        // Verify the file was actually stored
        if (!Storage::exists($path)) {
            Log::error('File upload failed - file does not exist at path', [
                'original_name' => $file->getClientOriginalName(),
                'stored_path' => $path,
                'url' => $url,
                'absolute_path' => storage_path('app/' . $path),
                'public_path' => public_path('storage/' . $url)
            ]);
            throw new \Exception("Failed to store file at path: {$path}");
        }

        // Check if the file is accessible via the public URL
        $publicPath = public_path('storage/' . $url);
        $fileIsAccessible = file_exists($publicPath);

        // Log the file path for debugging
        Log::info('File uploaded successfully', [
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
            Log::info('No URL provided for image deletion');
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
        Log::info('Attempting to delete image', [
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

        Log::info('Image deletion result', ['success' => $success]);
        return $success;
    }

    /**
     * Upload a video file to storage
     *
     * @param UploadedFile $file The uploaded file
     * @param string $folder The folder to store the file in
     * @param string|null $name The name to use for the file (product or recipe name)
     * @return string The URL of the uploaded file
     */
    public function uploadVideo(UploadedFile $file, string $folder = 'videos', ?string $name = null): string
    {
        // Generate a filename based on the name if provided
        if ($name) {
            // Sanitize the name for use as a filename
            $sanitizedName = $this->sanitizeFilename($name);
            $filename = $sanitizedName . '_' . time() . '.' . $file->getClientOriginalExtension();

            Log::info('Using product/recipe name for video filename', [
                'original_name' => $name,
                'sanitized_name' => $sanitizedName,
                'final_filename' => $filename
            ]);
        } else {
            // Fallback to the old method if no name is provided
            $filename = Str::uuid() . '_' . time() . '.' . $file->getClientOriginalExtension();
        }

        // Ensure the directory exists
        $storageDirectory = $folder;
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
        Log::info('Generated video URL', [
            'storage_url' => Storage::url($path),
            'final_url' => $url,
            'path' => $path,
            'absolute_path' => storage_path('app/' . $path),
            'public_path' => public_path('storage/' . str_replace('public/', '', $path))
        ]);

        // Verify the file was actually stored
        if (!Storage::exists($path)) {
            Log::error('Video upload failed - file does not exist at path', [
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
        Log::info('Video uploaded successfully', [
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
            Log::info('No URL provided for video deletion');
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
        Log::info('Attempting to delete video', [
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

        Log::info('Video deletion result', ['success' => $success]);
        return $success;
    }
}
