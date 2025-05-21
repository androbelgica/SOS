<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class FileBrowserController extends Controller
{
    /**
     * List images from a specific folder in storage
     *
     * @param string $type - 'products' or 'recipes'
     * @return \Illuminate\Http\JsonResponse
     */
    public function listImages(string $type)
    {
        // Validate the type parameter
        if (!in_array($type, ['products', 'recipes'])) {
            return response()->json([
                'error' => 'Invalid folder type. Must be "products" or "recipes".'
            ], 400);
        }

        try {
            // Check all possible directory paths
            $directory = "public/{$type}";
            $alternateDirectory = "public/public/{$type}";
            $thirdDirectory = "public/public/public/{$type}";

            // Log the directories we're checking
            Log::info("Checking directories", [
                'directory' => $directory,
                'alternateDirectory' => $alternateDirectory,
                'thirdDirectory' => $thirdDirectory,
                'directory_exists' => Storage::exists($directory),
                'alternateDirectory_exists' => Storage::exists($alternateDirectory),
                'thirdDirectory_exists' => Storage::exists($thirdDirectory)
            ]);

            // Create the directory if it doesn't exist
            if (!Storage::exists($directory)) {
                Storage::makeDirectory($directory);
                Log::info("Created directory: {$directory}");
            }

            // Get all files from all possible folders
            $files = [];

            if (Storage::exists($directory)) {
                $files = array_merge($files, Storage::files($directory));
                Log::info("Files in {$directory}", ['count' => count(Storage::files($directory))]);
            }

            if (Storage::exists($alternateDirectory)) {
                $files = array_merge($files, Storage::files($alternateDirectory));
                Log::info("Files in {$alternateDirectory}", ['count' => count(Storage::files($alternateDirectory))]);
            }

            if (Storage::exists($thirdDirectory)) {
                $files = array_merge($files, Storage::files($thirdDirectory));
                Log::info("Files in {$thirdDirectory}", ['count' => count(Storage::files($thirdDirectory))]);
            }

            // If no files found in any directory, try a direct disk approach
            if (empty($files)) {
                Log::warning("No files found in standard directories, trying direct disk access");

                // Try direct disk access for all possible paths
                $basePath = storage_path("app/public/{$type}");
                $altBasePath = storage_path("app/public/public/{$type}");
                $thirdBasePath = storage_path("app/public/public/public/{$type}");

                // Log all paths we're checking
                Log::info("Checking direct disk access paths", [
                    'type' => $type,
                    'basePath' => $basePath,
                    'basePath_exists' => file_exists($basePath) && is_dir($basePath),
                    'altBasePath' => $altBasePath,
                    'altBasePath_exists' => file_exists($altBasePath) && is_dir($altBasePath),
                    'thirdBasePath' => $thirdBasePath,
                    'thirdBasePath_exists' => file_exists($thirdBasePath) && is_dir($thirdBasePath)
                ]);

                // Check the first path
                if (file_exists($basePath) && is_dir($basePath)) {
                    $directFiles = scandir($basePath);
                    // Remove . and ..
                    $directFiles = array_diff($directFiles, ['.', '..']);

                    foreach ($directFiles as $file) {
                        $files[] = "public/{$type}/{$file}";
                    }

                    Log::info("Files found via direct disk access in standard path", [
                        'path' => $basePath,
                        'count' => count($directFiles),
                        'files' => $directFiles
                    ]);
                }

                // Check the second path
                if (file_exists($altBasePath) && is_dir($altBasePath)) {
                    $directFiles = scandir($altBasePath);
                    // Remove . and ..
                    $directFiles = array_diff($directFiles, ['.', '..']);

                    foreach ($directFiles as $file) {
                        $files[] = "public/public/{$type}/{$file}";
                    }

                    Log::info("Files found via direct disk access in alternate path", [
                        'path' => $altBasePath,
                        'count' => count($directFiles),
                        'files' => $directFiles
                    ]);
                }

                // Check the third path
                if (file_exists($thirdBasePath) && is_dir($thirdBasePath)) {
                    $directFiles = scandir($thirdBasePath);
                    // Remove . and ..
                    $directFiles = array_diff($directFiles, ['.', '..']);

                    foreach ($directFiles as $file) {
                        $files[] = "public/public/public/{$type}/{$file}";
                    }

                    Log::info("Files found via direct disk access in third path", [
                        'path' => $thirdBasePath,
                        'count' => count($directFiles),
                        'files' => $directFiles
                    ]);
                }

                // If we still don't have any files, try to create the directories
                if (empty($files)) {
                    Log::warning("No files found in any directory, trying to create directories");

                    // Create the directories if they don't exist
                    if (!file_exists($basePath)) {
                        mkdir($basePath, 0755, true);
                        Log::info("Created directory: {$basePath}");
                    }

                    if (!file_exists($altBasePath)) {
                        mkdir($altBasePath, 0755, true);
                        Log::info("Created directory: {$altBasePath}");
                    }
                }
            }

            // Log the directory and files for debugging
            Log::info('Directory contents', [
                'directory' => $directory,
                'alternateDirectory' => $alternateDirectory,
                'files_count' => count($files),
                'files' => $files
            ]);

            // Filter to only include image files
            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
            $images = [];

            foreach ($files as $file) {
                $extension = pathinfo($file, PATHINFO_EXTENSION);
                if (in_array(strtolower($extension), $imageExtensions)) {
                    // Get the correct URL for the image
                    // We need to make sure we're using the correct URL format
                    // The file path could be like 'public/products/image.jpg' or 'public/public/products/image.jpg'
                    // We need to convert it to '/storage/products/image.jpg'

                    // Handle all possible path formats
                    if (strpos($file, 'public/public/public/') !== false) {
                        // For paths like 'public/public/public/products/image.jpg'
                        $relativePath = str_replace('public/public/public/', '', $file);
                    } else if (strpos($file, 'public/public/') !== false) {
                        // For paths like 'public/public/products/image.jpg'
                        $relativePath = str_replace('public/public/', '', $file);
                    } else {
                        // For paths like 'public/products/image.jpg'
                        $relativePath = str_replace('public/', '', $file);
                    }

                    // Ensure the relativePath doesn't have any double slashes
                    $relativePath = str_replace('//', '/', $relativePath);

                    // Log the path conversion
                    Log::info('Path conversion for ' . $type, [
                        'original_file' => $file,
                        'relativePath' => $relativePath
                    ]);

                    $url = '/storage/' . $relativePath;

                    // Verify that the file is accessible via the public URL
                    $publicPath = public_path('storage/' . $relativePath);
                    $fileIsAccessible = file_exists($publicPath);

                    // If the file is not accessible via the public URL, try to find it directly
                    if (!$fileIsAccessible) {
                        // Try to find the file in the storage directory
                        $storagePath = storage_path('app/public/' . $relativePath);
                        if (file_exists($storagePath)) {
                            $fileIsAccessible = true;
                            Log::info("File found in storage path", [
                                'storagePath' => $storagePath
                            ]);
                        }

                        // Try to find the file in the public/public directory
                        $altStoragePath = storage_path('app/public/public/' . $relativePath);
                        if (file_exists($altStoragePath)) {
                            $fileIsAccessible = true;
                            Log::info("File found in alternate storage path", [
                                'altStoragePath' => $altStoragePath
                            ]);
                        }
                    }

                    // If the file is not accessible, try to create the symlink
                    if (!$fileIsAccessible) {
                        Log::warning('File not accessible, trying to create symlink', [
                            'file_path' => $file,
                            'public_path' => $publicPath
                        ]);

                        // Try to create the symlink directory if it doesn't exist
                        $storageDir = dirname($publicPath);
                        if (!file_exists($storageDir)) {
                            mkdir($storageDir, 0755, true);
                        }

                        // Try to create the symlink
                        try {
                            Artisan::call('storage:link');
                            $fileIsAccessible = file_exists($publicPath);
                        } catch (\Exception $e) {
                            Log::error('Failed to create symlink', [
                                'error' => $e->getMessage()
                            ]);
                        }
                    }

                    // Log the file path and URL for debugging
                    Log::info('Image file info', [
                        'file_path' => $file,
                        'relative_path' => $relativePath,
                        'url' => $url,
                        'public_path' => $publicPath,
                        'file_exists' => $fileIsAccessible
                    ]);

                    // Skip files that don't exist in the public directory
                    if (!$fileIsAccessible) {
                        Log::warning('Image file not accessible in public directory', [
                            'file_path' => $file,
                            'public_path' => $publicPath
                        ]);
                        continue;
                    }

                    $filename = basename($file);
                    $size = Storage::size($file);
                    $lastModified = Storage::lastModified($file);

                    $images[] = [
                        'url' => $url,
                        'full_path' => $file,
                        'filename' => $filename,
                        'size' => $size,
                        'size_formatted' => $this->formatFileSize($size),
                        'last_modified' => date('Y-m-d H:i:s', $lastModified),
                        'last_modified_formatted' => $this->formatLastModified($lastModified),
                    ];
                }
            }

            // Sort images by last modified date (newest first)
            usort($images, function ($a, $b) {
                return strtotime($b['last_modified']) - strtotime($a['last_modified']);
            });

            return response()->json([
                'images' => $images,
                'count' => count($images),
                'folder' => $type
            ]);
        } catch (\Exception $e) {
            Log::error('Error listing images', [
                'folder' => $type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to list images: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format file size to human-readable format
     *
     * @param int $size
     * @return string
     */
    private function formatFileSize(int $size): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }
        return round($size, 2) . ' ' . $units[$i];
    }

    /**
     * Format last modified timestamp to relative time
     *
     * @param int $timestamp
     * @return string
     */
    private function formatLastModified(int $timestamp): string
    {
        $diff = time() - $timestamp;

        if ($diff < 60) {
            return 'Just now';
        } elseif ($diff < 3600) {
            $minutes = floor($diff / 60);
            return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 86400) {
            $hours = floor($diff / 3600);
            return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 604800) {
            $days = floor($diff / 86400);
            return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
        } else {
            return date('M j, Y', $timestamp);
        }
    }
}
