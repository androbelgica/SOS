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
        'payment_status'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2'
    ];

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
}
