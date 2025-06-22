<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class DeliveryAssignmentNotification extends Notification
{
    use Queueable;

    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";

        $message = (new MailMessage)
            ->subject("New Delivery Assignment: Order {$orderIdentifier}")
            ->greeting("Hello {$notifiable->name}")
            ->line("You have been assigned a new delivery order.")
            ->line("Order Status: " . ucfirst($this->order->status))
            ->line('Order Details:');
        foreach ($this->order->items as $item) {
            $message->line("- {$item->product->name} x {$item->quantity} (₱{$item->price} each)");
        }
        $message->line("Total Amount: ₱{$this->order->total_amount}")
            ->action('View Delivery Assignment', route('admin.orders.show', $this->order))
            ->line('Please proceed to process this delivery.');

        return $message;
    }

    public function toArray($notifiable): array
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";
        return [
            'title' => "New Delivery Assignment",
            'order_id' => $this->order->id,
            'order_number' => $orderIdentifier,
            'status' => $this->order->status,
            'message' => "You have been assigned a new delivery order.",
            'action_url' => route('admin.orders.show', $this->order),
            'total_amount' => $this->order->total_amount,
            'type' => 'delivery_assignment',
            'created_at' => now(),
        ];
    }

    public function toDatabase($notifiable)
    {
        $data = $this->toArray($notifiable);
        return [
            'title' => 'New Delivery Assignment',
            'message' => 'You have been assigned a new delivery order.',
            'user_id' => $notifiable->id,
            'type' => static::class,
            'data' => $data,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
