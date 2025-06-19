<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class BatchOrderProcessed extends Notification
{
    use Queueable;

    protected $orders;
    protected $processType;
    protected $summary;

    public function __construct(array $orders, string $processType, array $summary)
    {
        $this->orders = $orders;
        $this->processType = $processType;
        $this->summary = $summary;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'process_type' => $this->processType,
            'total_orders' => count($this->orders),
            'successful' => $this->summary['successful'] ?? 0,
            'failed' => $this->summary['failed'] ?? 0,
            'message' => "Batch {$this->processType} completed: {$this->summary['successful']} successful, {$this->summary['failed']} failed",
            'action_url' => route('admin.orders.batch-report', ['batch' => $this->summary['batch_id']]),
            'type' => 'batch_order_processed',
            'created_at' => now(),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject("Batch Order Processing Report: {$this->processType}")
            ->greeting("Hello Admin")
            ->line("The batch {$this->processType} process has been completed.");

        // Add summary statistics
        $message->line('Processing Summary:')
            ->line("- Total Orders: " . count($this->orders))
            ->line("- Successfully Processed: {$this->summary['successful']}")
            ->line("- Failed: {$this->summary['failed']}");

        // If there are failures, add them to the email
        if ($this->summary['failed'] > 0 && !empty($this->summary['failed_orders'])) {
            $message->line('Failed Orders:');
            foreach ($this->summary['failed_orders'] as $order) {
                $message->line("- Order #{$order['id']}: {$order['error']}");
            }
        }

        return $message
            ->action('View Full Report', route('admin.orders.batch-report', ['batch' => $this->summary['batch_id']]))
            ->line('Please review any failed orders and take necessary action.');
    }
}
