<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Notification;

class TestNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:notifications {--user-id=1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the notification system by creating sample notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        
        // Check if user exists
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return 1;
        }

        $this->info("Testing notifications for user: {$user->name} (ID: {$user->id})");
        $this->info("User role: {$user->role}");

        try {
            // Test database connection
            $this->info("Testing database connection...");
            $existingCount = Notification::count();
            $this->info("Current notifications in database: {$existingCount}");

            // Create test notifications based on user role
            $notifications = [];
            
            if ($user->role === 'admin') {
                $this->info("Creating admin-specific notifications...");
                
                $notifications[] = Notification::create([
                    'user_id' => $user->id,
                    'type' => 'recipe_submitted',
                    'title' => 'New Recipe Submitted',
                    'message' => 'John Doe submitted a new recipe "Grilled Salmon" for review.',
                    'data' => ['recipe_id' => 1, 'recipe_title' => 'Grilled Salmon', 'submitter_name' => 'John Doe']
                ]);
                
                $notifications[] = Notification::create([
                    'user_id' => $user->id,
                    'type' => 'recipe_submitted',
                    'title' => 'New Recipe Submitted',
                    'message' => 'Jane Smith submitted a new recipe "Seafood Paella" for review.',
                    'data' => ['recipe_id' => 2, 'recipe_title' => 'Seafood Paella', 'submitter_name' => 'Jane Smith']
                ]);
            } else {
                $this->info("Creating user-specific notifications...");
                
                $notifications[] = Notification::create([
                    'user_id' => $user->id,
                    'type' => 'recipe_approved',
                    'title' => 'Recipe Approved!',
                    'message' => 'Your recipe "Seafood Pasta" has been approved and is now live.',
                    'data' => ['recipe_id' => 1, 'recipe_title' => 'Seafood Pasta']
                ]);
                
                $notifications[] = Notification::create([
                    'user_id' => $user->id,
                    'type' => 'recipe_under_review',
                    'title' => 'Recipe Under Review',
                    'message' => 'Your recipe "Fish Tacos" is now being reviewed by our team.',
                    'data' => ['recipe_id' => 2, 'recipe_title' => 'Fish Tacos']
                ]);
                
                $notifications[] = Notification::create([
                    'user_id' => $user->id,
                    'type' => 'recipe_rejected',
                    'title' => 'Recipe Needs Revision',
                    'message' => 'Your recipe "Shrimp Curry" needs some revisions. Please check the feedback.',
                    'data' => ['recipe_id' => 3, 'recipe_title' => 'Shrimp Curry']
                ]);
            }
            
            // Create a general test notification
            $notifications[] = Notification::create([
                'user_id' => $user->id,
                'type' => 'test',
                'title' => 'Test Notification',
                'message' => 'This is a test notification created by the test command.',
                'data' => ['test' => true, 'created_at' => now()->toISOString()]
            ]);

            $this->info("Created " . count($notifications) . " test notifications successfully!");

            // Display created notifications
            $this->info("\nCreated notifications:");
            foreach ($notifications as $notification) {
                $this->line("- [{$notification->type}] {$notification->title}");
            }

            // Test user relationships
            $this->info("\nTesting user notification relationships...");
            $userNotifications = $user->notifications()->count();
            $unreadNotifications = $user->unreadNotifications()->count();
            
            $this->info("Total notifications for user: {$userNotifications}");
            $this->info("Unread notifications for user: {$unreadNotifications}");

            // Test notification queries
            $this->info("\nTesting notification queries...");
            $recent = $user->notifications()->orderBy('created_at', 'desc')->limit(5)->get();
            $this->info("Recent notifications (last 5): " . $recent->count());
            
            foreach ($recent as $notification) {
                $status = $notification->read_at ? 'READ' : 'UNREAD';
                $this->line("  - [{$status}] {$notification->title} (ID: {$notification->id})");
            }

            $this->info("\n✅ Notification system test completed successfully!");
            $this->info("You can now test the frontend by visiting the notification dropdown or /debug/notifications");

            return 0;

        } catch (\Exception $e) {
            $this->error("Error testing notifications: " . $e->getMessage());
            $this->error("Stack trace: " . $e->getTraceAsString());
            return 1;
        }
    }
}
