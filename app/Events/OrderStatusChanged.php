<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orderId;
    public $userId;
    public $status;
    public $paymentStatus;
    public $message;

    public function __construct($orderId, $userId, $status, $paymentStatus, $message = null)
    {
        $this->orderId = $orderId;
        $this->userId = $userId;
        $this->status = $status;
        $this->paymentStatus = $paymentStatus;
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->userId);
    }

    public function broadcastWith()
    {
        return [
            'orderId' => $this->orderId,
            'status' => $this->status,
            'paymentStatus' => $this->paymentStatus,
            'message' => $this->message,
        ];
    }

    public function broadcastAs()
    {
        return 'OrderStatusChanged';
    }
}
