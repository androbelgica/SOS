<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OrderShipped extends Notification
{
    use Queueable;

    protected $order;
    protected $trackingNumber;

    public function __construct(Order $order, string $trackingNumber)
    {
        $this->order = $order;
        $this->trackingNumber = $trackingNumber;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number ?? "#{$this->order->id}",
            'tracking_number' => $this->trackingNumber,
            'message' => "Your order has been shipped! Track your package with tracking number: {$this->trackingNumber}",
            'action_url' => route('orders.track', ['order' => $this->order->id, 'tracking' => $this->trackingNumber]),
            'total_amount' => $this->order->total_amount,
            'type' => 'order_shipped',
            'created_at' => now(),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";

        return (new MailMessage)
            ->subject("Order {$orderIdentifier} Shipped")
            ->greeting("Hello {$notifiable->name}")
            ->line("Great news! Your order has been shipped!")
            ->line("Tracking Number: {$this->trackingNumber}")
            ->action('Track Your Order', route('orders.track', ['order' => $this->order->id, 'tracking' => $this->trackingNumber]))
            ->line('Estimated delivery time: 2-3 business days')
            ->line('Thank you for shopping with us!');
    }
}
