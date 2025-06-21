<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RecipeCommentAdded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $recipeId;
    public $comment;

    public function __construct($recipeId, array $comment)
    {
        $this->recipeId = $recipeId;
        $this->comment = $comment;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('recipe.' . $this->recipeId);
    }

    public function broadcastWith()
    {
        return [
            'comment' => $this->comment,
        ];
    }

    public function broadcastAs()
    {
        return 'RecipeCommentAdded';
    }
}
