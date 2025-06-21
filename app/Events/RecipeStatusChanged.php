<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RecipeStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $recipeId;
    public $userId;
    public $status;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct($recipeId, $userId, $status, $message = null)
    {
        $this->recipeId = $recipeId;
        $this->userId = $userId;
        $this->status = $status;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        // Only the user who owns the recipe should receive this notification
        return new PrivateChannel('user.' . $this->userId);
    }

    public function broadcastWith()
    {
        return [
            'recipeId' => $this->recipeId,
            'status' => $this->status,
            'message' => $this->message,
        ];
    }

    public function broadcastAs()
    {
        return 'RecipeStatusChanged';
    }
}
