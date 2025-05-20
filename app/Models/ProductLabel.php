<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductLabel extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'qr_code_path',
        'label_path',
        'is_printed'
    ];

    protected $casts = [
        'is_printed' => 'boolean'
    ];

    /**
     * Get the order that owns the label.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the order item that owns the label.
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, ['order_id', 'product_id'], ['order_id', 'product_id']);
    }

    /**
     * Get the product that owns the label.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
