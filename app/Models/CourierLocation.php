<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'courier_id',
        'latitude',
        'longitude',
        'order_id',
        'updated_at',
    ];

    public function courier()
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
