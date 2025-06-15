<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductRecognition extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'image_path',
        'detected_labels',
        'detected_objects',
        'detected_text',
        'seafood_detected',
        'suggested_products',
        'confidence_score',
        'is_mock_data',
        'notes'
    ];

    protected $casts = [
        'detected_labels' => 'array',
        'detected_objects' => 'array',
        'detected_text' => 'array',
        'suggested_products' => 'array',
        'seafood_detected' => 'boolean',
        'is_mock_data' => 'boolean',
        'confidence_score' => 'decimal:2'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the highest confidence label
     */
    public function getTopLabelAttribute(): ?array
    {
        if (empty($this->detected_labels)) {
            return null;
        }

        return collect($this->detected_labels)
            ->sortByDesc('confidence')
            ->first();
    }

    /**
     * Get the highest confidence object
     */
    public function getTopObjectAttribute(): ?array
    {
        if (empty($this->detected_objects)) {
            return null;
        }

        return collect($this->detected_objects)
            ->sortByDesc('confidence')
            ->first();
    }
}
