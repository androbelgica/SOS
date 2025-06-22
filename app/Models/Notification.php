<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    public function isUnread(): bool
    {
        return is_null($this->read_at);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Static methods for creating notifications
    public static function createRecipeApproved($userId, $recipeId, $recipeTitle)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'recipe_approved',
            'title' => 'Recipe Approved!',
            'message' => "Your recipe '{$recipeTitle}' has been approved and is now live.",
            'data' => ['recipe_id' => $recipeId, 'recipe_title' => $recipeTitle]
        ]);
    }

    public static function createRecipeRejected($userId, $recipeId, $recipeTitle, $reason)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'recipe_rejected',
            'title' => 'Recipe Needs Revision',
            'message' => "Your recipe '{$recipeTitle}' needs some changes. Reason: {$reason}",
            'data' => ['recipe_id' => $recipeId, 'recipe_title' => $recipeTitle, 'reason' => $reason]
        ]);
    }

    public static function createRecipeSubmitted($adminUserId, $recipeId, $recipeTitle, $submitterName)
    {
        return self::create([
            'user_id' => $adminUserId,
            'type' => 'recipe_submitted',
            'title' => 'New Recipe Submitted',
            'message' => "{$submitterName} submitted a new recipe '{$recipeTitle}' for review.",
            'data' => ['recipe_id' => $recipeId, 'recipe_title' => $recipeTitle, 'submitter_name' => $submitterName]
        ]);
    }

    public static function createRecipeUnderReview($userId, $recipeId, $recipeTitle)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'recipe_under_review',
            'title' => 'Recipe Under Review',
            'message' => "Your recipe '{$recipeTitle}' is now being reviewed by our team.",
            'data' => ['recipe_id' => $recipeId, 'recipe_title' => $recipeTitle]
        ]);
    }

    public static function createRecipeCommented($recipeAuthorId, $recipeId, $recipeTitle, $commenterName, $commentId)
    {
        return self::create([
            'user_id' => $recipeAuthorId,
            'type' => 'recipe_commented',
            'title' => 'New Comment on Your Recipe',
            'message' => "{$commenterName} commented on your recipe '{$recipeTitle}'.",
            'data' => [
                'recipe_id' => $recipeId,
                'recipe_title' => $recipeTitle,
                'commenter_name' => $commenterName,
                'comment_id' => $commentId
            ]
        ]);
    }

    public static function createCommentReplied($commentAuthorId, $recipeId, $recipeTitle, $replierName, $commentId)
    {
        return self::create([
            'user_id' => $commentAuthorId,
            'type' => 'comment_replied',
            'title' => 'New Reply to Your Comment',
            'message' => "{$replierName} replied to your comment on recipe '{$recipeTitle}'.",
            'data' => [
                'recipe_id' => $recipeId,
                'recipe_title' => $recipeTitle,
                'replier_name' => $replierName,
                'comment_id' => $commentId
            ]
        ]);
    }

    public static function createRecipeReacted($recipeAuthorId, $recipeId, $recipeTitle, $reactorName, $reactionType)
    {
        return self::create([
            'user_id' => $recipeAuthorId,
            'type' => 'recipe_reacted',
            'title' => 'New Reaction on Your Recipe',
            'message' => "{$reactorName} reacted to your recipe '{$recipeTitle}' with {$reactionType}.",
            'data' => [
                'recipe_id' => $recipeId,
                'recipe_title' => $recipeTitle,
                'reactor_name' => $reactorName,
                'reaction_type' => $reactionType
            ]
        ]);
    }

    public static function createCommentReacted($commentAuthorId, $recipeId, $recipeTitle, $reactorName, $reactionType, $commentId)
    {
        return self::create([
            'user_id' => $commentAuthorId,
            'type' => 'comment_reacted',
            'title' => 'New Reaction on Your Comment',
            'message' => "{$reactorName} reacted to your comment on recipe '{$recipeTitle}' with {$reactionType}.",
            'data' => [
                'recipe_id' => $recipeId,
                'recipe_title' => $recipeTitle,
                'reactor_name' => $reactorName,
                'reaction_type' => $reactionType,
                'comment_id' => $commentId
            ]
        ]);
    }

    public static function createRecipeDeleted($userId, $recipeTitle, $adminName)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'recipe_deleted',
            'title' => 'Recipe Deleted',
            'message' => "Your recipe '{$recipeTitle}' has been deleted by administrator {$adminName}.",
            'data' => [
                'recipe_title' => $recipeTitle,
                'admin_name' => $adminName
            ]
        ]);
    }

    // Order notification methods
    public static function createOrderPlaced($userId, $orderId, $orderNumber, $totalAmount)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'order_placed',
            'title' => 'Order Placed Successfully',
            'message' => "Your order {$orderNumber} has been placed successfully!",
            'data' => [
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount
            ]
        ]);
    }

    public static function createOrderStatusChanged($userId, $orderId, $orderNumber, $status, $items, $totalAmount)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'order_status_changed',
            'title' => 'Order Status Updated',
            'message' => "Order {$orderNumber} status has been updated to: " . ucfirst($status),
            'data' => [
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'status' => $status,
                'items' => $items,
                'total_amount' => $totalAmount
            ]
        ]);
    }

    public static function createOrderPaymentStatusChanged($userId, $orderId, $orderNumber, $paymentStatus, $items, $totalAmount)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'order_payment_status_changed',
            'title' => 'Payment Status Updated',
            'message' => "Your order payment status has been updated to: " . ucfirst($paymentStatus),
            'data' => [
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'payment_status' => $paymentStatus,
                'items' => $items,
                'total_amount' => $totalAmount
            ]
        ]);
    }

    public static function createOrderShipped($userId, $orderId, $orderNumber, $trackingNumber, $totalAmount)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'order_shipped',
            'title' => 'Order Shipped',
            'message' => "Your order {$orderNumber} has been shipped! Track your package with tracking number: {$trackingNumber}",
            'data' => [
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'tracking_number' => $trackingNumber,
                'total_amount' => $totalAmount
            ]
        ]);
    }

    public static function createAdminOrderAlert($adminUserId, $orderId, $orderNumber, $type, $message, $totalAmount, $priority = 'normal')
    {
        return self::create([
            'user_id' => $adminUserId,
            'type' => 'admin_order_alert',
            'title' => "[Admin Alert] {$type}",
            'message' => $message,
            'data' => [
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'alert_type' => $type,
                'total_amount' => $totalAmount,
                'priority' => $priority
            ]
        ]);
    }

    public static function createLowStockAlert($adminUserId, $productId, $productName, $currentStock, $threshold)
    {
        return self::create([
            'user_id' => $adminUserId,
            'type' => 'low_stock_alert',
            'title' => 'Low Stock Alert',
            'message' => "The product '{$productName}' is running low on stock.",
            'data' => [
                'product_id' => $productId,
                'product_name' => $productName,
                'current_stock' => $currentStock,
                'threshold' => $threshold
            ]
        ]);
    }

    public static function createBatchOrderProcessed($adminUserId, $processType, $summary)
    {
        return self::create([
            'user_id' => $adminUserId,
            'type' => 'batch_order_processed',
            'title' => 'Batch Order Processing Report',
            'message' => "Batch {$processType} completed: {$summary['successful']} successful, {$summary['failed']} failed.",
            'data' => [
                'process_type' => $processType,
                'summary' => $summary
            ]
        ]);
    }

    public static function createDeliveryAssignment($userId, $orderId, $orderNumber, $status, $items, $totalAmount)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'delivery_assignment',
            'title' => 'New Delivery Assignment',
            'message' => 'You have been assigned a new delivery order.',
            'data' => [
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'status' => $status,
                'items' => $items,
                'total_amount' => $totalAmount,
                'type' => 'delivery_assignment',
                'created_at' => now(),
            ]
        ]);
    }
}
