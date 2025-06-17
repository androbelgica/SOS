<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user
     */
    public function index()
    {
        try {
            $notifications = Auth::user()
                ->notifications()
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return Inertia::render('Notifications/Index', [
                'notifications' => $notifications
            ]);
        } catch (\Exception $e) {
            // Return empty notifications if table doesn't exist
            return Inertia::render('Notifications/Index', [
                'notifications' => collect()->paginate(20)
            ]);
        }
    }

    /**
     * Get unread notifications count for the authenticated user
     */
    public function getUnreadCount()
    {
        $count = Auth::user()->unreadNotifications()->count();
        return response()->json(['count' => $count]);
    }

    /**
     * Get recent notifications for dropdown
     */
    public function getRecent()
    {
        $notifications = Auth::user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $unreadCount = Auth::user()->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Notification $notification)
    {
        // Ensure the notification belongs to the authenticated user
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        try {
            Auth::user()
                ->unreadNotifications()
                ->update(['read_at' => now()]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => 'Notifications table not available']);
        }
    }

    /**
     * Delete a notification
     */
    public function destroy(Notification $notification)
    {
        // Ensure the notification belongs to the authenticated user
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Clear all read notifications
     */
    public function clearRead()
    {
        Auth::user()
            ->notifications()
            ->whereNotNull('read_at')
            ->delete();

        return response()->json(['success' => true]);
    }
}
