import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ChatBubbleLeftIcon, HeartIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid';
import ReactionButton from './ReactionButton';
import CommentItem from './CommentItem';
import toast from 'react-hot-toast';

export default function CommentSection({ recipe, auth, className = '' }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReplyForm, setShowReplyForm] = useState(null);
    const [editingComment, setEditingComment] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        comment: '',
        parent_id: null
    });

    const { data: editData, setData: setEditData, put, processing: editProcessing } = useForm({
        comment: ''
    });

    // Load comments on component mount
    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const response = await fetch(`/api/recipes/${recipe.id}/comments`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setComments(result.comments.data || []);
        } catch (error) {
            console.error('Failed to load comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`/api/recipes/${recipe.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok) {
                if (data.parent_id) {
                    // Add reply to existing comment
                    setComments(prev => prev.map(comment => 
                        comment.id === data.parent_id 
                            ? { ...comment, replies: [...(comment.replies || []), result.comment] }
                            : comment
                    ));
                } else {
                    // Add new top-level comment
                    setComments(prev => [result.comment, ...prev]);
                }
                
                reset();
                setShowReplyForm(null);
                toast.success('Comment added successfully!');
            } else {
                toast.error(result.message || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Failed to submit comment:', error);
            toast.error('Failed to add comment');
        }
    };

    const handleEditComment = async (commentId) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ comment: editData.comment })
            });

            const result = await response.json();
            
            if (response.ok) {
                setComments(prev => prev.map(comment => 
                    comment.id === commentId 
                        ? { ...comment, ...result.comment }
                        : comment
                ));
                setEditingComment(null);
                toast.success('Comment updated successfully!');
            } else {
                toast.error(result.message || 'Failed to update comment');
            }
        } catch (error) {
            console.error('Failed to update comment:', error);
            toast.error('Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                }
            });

            if (response.ok) {
                setComments(prev => prev.filter(comment => comment.id !== commentId));
                toast.success('Comment deleted successfully!');
            } else {
                const result = await response.json();
                toast.error(result.message || 'Failed to delete comment');
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
            toast.error('Failed to delete comment');
        }
    };

    const handleReactionToggle = async (reactionType, type = 'recipe', targetId = null) => {
        const url = type === 'recipe' 
            ? `/api/recipes/${recipe.id}/reactions`
            : `/api/comments/${targetId}/reactions`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ reaction_type: reactionType })
            });

            const result = await response.json();
            
            if (response.ok) {
                if (type === 'recipe') {
                    // Update recipe reactions in parent component if needed
                    // This would require a callback prop from parent
                } else {
                    // Update comment reactions
                    setComments(prev => prev.map(comment => 
                        comment.id === targetId 
                            ? { 
                                ...comment, 
                                reaction_counts: result.reaction_counts,
                                user_reaction: result.user_reaction 
                            }
                            : comment
                    ));
                }
                toast.success(result.message);
            } else {
                toast.error(result.message || 'Failed to toggle reaction');
            }
        } catch (error) {
            console.error('Failed to toggle reaction:', error);
            toast.error('Failed to toggle reaction');
        }
    };

    const startReply = (commentId) => {
        setData('parent_id', commentId);
        setShowReplyForm(commentId);
    };

    const startEdit = (comment) => {
        setEditData('comment', comment.comment);
        setEditingComment(comment.id);
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className={`${className} animate-pulse`}>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex space-x-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Comment Form */}
            {auth.user && (
                <div className="mb-8">
                    <form onSubmit={handleSubmitComment} className="space-y-4">
                        <div className="flex space-x-3">
                            <img
                                src={auth.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=3b82f6&color=fff`}
                                alt={auth.user.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <textarea
                                    value={data.comment}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    placeholder="Share your thoughts about this recipe..."
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                                    rows="3"
                                    maxLength="500"
                                />
                                {errors.comment && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.comment}</p>
                                )}
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {data.comment.length}/500
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.comment.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {processing ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-12">
                        <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No comments yet. Be the first to share your thoughts!
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            auth={auth}
                            onReply={startReply}
                            onEdit={startEdit}
                            onDelete={handleDeleteComment}
                            onReactionToggle={handleReactionToggle}
                            showReplyForm={showReplyForm}
                            setShowReplyForm={setShowReplyForm}
                            editingComment={editingComment}
                            setEditingComment={setEditingComment}
                            editData={editData}
                            setEditData={setEditData}
                            handleEditComment={handleEditComment}
                            editProcessing={editProcessing}
                            formatTimeAgo={formatTimeAgo}
                            data={data}
                            setData={setData}
                            handleSubmitComment={handleSubmitComment}
                            processing={processing}
                            errors={errors}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
