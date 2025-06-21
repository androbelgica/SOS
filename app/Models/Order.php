<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'total_amount',
        'status',
        'shipping_address',
        'billing_address',
        'payment_status',
        'payment_method',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2'
    ];

    // Constants for order thresholds
    const HIGH_VALUE_THRESHOLD = 10000; // ₱10,000
    const LOW_STOCK_THRESHOLD = 5;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot('quantity', 'price');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Check if the order can be cancelled by the customer
     *
     * Conditions:
     * 1. Order must be in 'pending' status
     * 2. Order must be less than 30 minutes old
     *
     * @return bool
     */
    public function isCancellable(): bool
    {
        // Check if order status is pending
        if ($this->status !== 'pending') {
            return false;
        }

        // Check if order is less than 30 minutes old
        $orderTime = $this->created_at;
        $thirtyMinutesAfterOrder = $orderTime->copy()->addMinutes(30);

        return now()->lt($thirtyMinutesAfterOrder);
    }

    /**
     * Generate a unique 8-digit order number
     * Format: SOS-YYYYMMDD-XXXX where XXXX is a sequential number
     *
     * @return string
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'SOS';
        $datePart = now()->format('Ymd');

        // Get the latest order with the same date prefix
        $latestOrder = self::where('order_number', 'like', "{$prefix}-{$datePart}-%")
            ->orderBy('id', 'desc')
            ->first();

        // Extract the sequence number or start with 0001
        $sequenceNumber = 1;
        if ($latestOrder) {
            $parts = explode('-', $latestOrder->order_number);
            $lastSequence = intval(end($parts));
            $sequenceNumber = $lastSequence + 1;
        }

        // Format the sequence number with leading zeros
        $sequencePart = str_pad($sequenceNumber, 4, '0', STR_PAD_LEFT);

        return "{$prefix}-{$datePart}-{$sequencePart}";
    }

    protected static function booted()
    {
        // Send notification when order is created
        static::created(function ($order) {
            // Notify customer
            \App\Models\Notification::createOrderPlaced(
                $order->user_id,
                $order->id,
                $order->order_number,
                $order->total_amount
            );

            // Notify admins about order placed
            \App\Models\User::admins()->each(function ($admin) use ($order) {
                \App\Models\Notification::createAdminOrderAlert(
                    $admin->id,
                    $order->id,
                    $order->order_number,
                    'order_placed',
                    "A new order (₱{$order->total_amount}) was placed by {$order->user->name}",
                    $order->total_amount,
                    'normal'
                );
            });

            // Check for low stock after order
            foreach ($order->items as $item) {
                if ($item->product->stock <= self::LOW_STOCK_THRESHOLD) {
                    // Notify admin about low stock
                    \App\Models\User::admins()->each(function ($admin) use ($item) {
                        \App\Models\Notification::createLowStockAlert(
                            $admin->id,
                            $item->product->id,
                            $item->product->name,
                            $item->product->stock,
                            self::LOW_STOCK_THRESHOLD
                        );
                    });
                }
            }
        });

        // Send notification when order status changes
        static::updated(function ($order) {
            if ($order->isDirty('status')) {
                $items = $order->items->map(function ($item) {
                    return [
                        'product' => $item->product->name,
                        'quantity' => $item->quantity,
                        'price' => $item->price
                    ];
                })->toArray();
                \App\Models\Notification::createOrderStatusChanged(
                    $order->user_id,
                    $order->id,
                    $order->order_number,
                    $order->status,
                    $items,
                    $order->total_amount
                );

                // If status changed to "shipped", send shipping notification
                if ($order->status === 'shipped' && $order->tracking_number) {
                    \App\Models\Notification::createOrderShipped(
                        $order->user_id,
                        $order->id,
                        $order->order_number,
                        $order->tracking_number,
                        $order->total_amount
                    );
                }
            }

            if ($order->isDirty('payment_status')) {
                $items = $order->items->map(function ($item) {
                    return [
                        'product' => $item->product->name,
                        'quantity' => $item->quantity,
                        'price' => $item->price
                    ];
                })->toArray();
                \App\Models\Notification::createOrderPaymentStatusChanged(
                    $order->user_id,
                    $order->id,
                    $order->order_number,
                    $order->payment_status,
                    $items,
                    $order->total_amount
                );

                // Check for potential fraud (multiple payment failures)
                if ($order->payment_failures >= 3) {
                    \App\Models\User::admins()->each(function ($admin) use ($order) {
                        \App\Models\Notification::createAdminOrderAlert(
                            $admin->id,
                            $order->id,
                            $order->order_number,
                            'potential_fraud',
                            "Multiple payment failures detected for Order #{$order->id}",
                            $order->total_amount,
                            'high'
                        );
                    });
                }
            }
        });
    }

    /**
     * Process a batch of orders
     *
     * @param array $orderIds
     * @param string $processType
     * @return array
     */
    public static function processBatch(array $orderIds, string $processType): array
    {
        $summary = [
            'batch_id' => uniqid('batch_'),
            'successful' => 0,
            'failed' => 0,
            'failed_orders' => [],
        ];

        $orders = self::whereIn('id', $orderIds)->get();

        foreach ($orders as $order) {
            try {
                switch ($processType) {
                    case 'ship':
                        $order->ship();
                        break;
                    case 'cancel':
                        $order->cancel();
                        break;
                        // Add more process types as needed
                }
                $summary['successful']++;
            } catch (\Exception $e) {
                $summary['failed']++;
                $summary['failed_orders'][] = [
                    'id' => $order->id,
                    'error' => $e->getMessage()
                ];
            }
        }

        // Notify admins about batch processing
        \App\Models\User::admins()->each(function ($admin) use ($orders, $processType, $summary) {
            \App\Models\Notification::createBatchOrderProcessed(
                $admin->id,
                $processType,
                $summary
            );
        });

        return $summary;
    }

    /**
     * The delivery staff assigned to this order.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Scope: Orders assigned to a specific delivery staff.
     */
    public function scopeAssignedToDelivery($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope: Orders with a specific delivery status.
     */
    public function scopeWithDeliveryStatus($query, $status)
    {
        return $query->where('delivery_status', $status);
    }
}
