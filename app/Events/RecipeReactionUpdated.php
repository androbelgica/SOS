<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RecipeReactionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $recipeId;
    public $reactionCounts;
    public $userReaction;

    public function __construct($recipeId, array $reactionCounts, $userReaction)
    {
        $this->recipeId = $recipeId;
        $this->reactionCounts = $reactionCounts;
        $this->userReaction = $userReaction;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('recipe.' . $this->recipeId);
    }

    public function broadcastWith()
    {
        return [
            'reactionCounts' => $this->reactionCounts,
            'userReaction' => $this->userReaction,
        ];
    }

    public function broadcastAs()
    {
        return 'RecipeReactionUpdated';
    }
}
