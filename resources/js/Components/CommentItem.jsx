import React from 'react';
import { EllipsisHorizontalIcon, PencilIcon, TrashIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import ReactionButton from './ReactionButton';

export default function CommentItem({
    comment,
    auth,
    onReply,
    onEdit,
    onDelete,
    onReactionToggle,
    showReplyForm,
    setShowReplyForm,
    editingComment,
    setEditingComment,
    editData,
    setEditData,
    handleEditComment,
    editProcessing,
    formatTimeAgo,
    data,
    setData,
    handleSubmitComment,
    processing,
    errors,
    isReply = false
}) {
    const canEdit = auth.user && (
        comment.user.id === auth.user.id && 
        new Date(comment.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    
    const canDelete = auth.user && (
        comment.user.id === auth.user.id || auth.user.role === 'admin'
    );

    return (
        <div className={`${isReply ? 'ml-12' : ''}`}>
            <div className="flex space-x-3">
                {/* Avatar */}
                <img
                    src={comment.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=3b82f6&color=fff`}
                    alt={comment.user.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                    {/* Comment Header */}
                    <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                            {comment.user.name}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(comment.created_at)}
                        </span>
                        {comment.is_edited && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                (edited)
                            </span>
                        )}
                    </div>

                    {/* Comment Content */}
                    {editingComment === comment.id ? (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleEditComment(comment.id);
                        }} className="space-y-3">
                            <textarea
                                value={editData.comment}
                                onChange={(e) => setEditData('comment', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                                rows="3"
                                maxLength="500"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {editData.comment.length}/500
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingComment(null)}
                                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editProcessing || !editData.comment.trim()}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {editProcessing ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                {comment.comment}
                            </p>
                        </div>
                    )}

                    {/* Comment Actions */}
                    {editingComment !== comment.id && (
                        <div className="flex items-center space-x-4">
                            {/* Reaction Button */}
                            {auth.user && (
                                <ReactionButton
                                    reactionCounts={comment.reaction_counts || {}}
                                    userReaction={comment.user_reaction}
                                    onReactionToggle={(reactionType) => onReactionToggle(reactionType, 'comment', comment.id)}
                                    size="sm"
                                />
                            )}

                            {/* Reply Button */}
                            {auth.user && !isReply && (
                                <button
                                    onClick={() => onReply(comment.id)}
                                    className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <ChatBubbleLeftIcon className="w-4 h-4" />
                                    <span>Reply</span>
                                </button>
                            )}

                            {/* Edit/Delete Menu */}
                            {(canEdit || canDelete) && (
                                <div className="relative group">
                                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                                        <EllipsisHorizontalIcon className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                        {canEdit && (
                                            <button
                                                onClick={() => onEdit(comment)}
                                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                                <span>Edit</span>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => onDelete(comment.id)}
                                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                <span>Delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reply Form */}
                    {showReplyForm === comment.id && auth.user && (
                        <div className="mt-4">
                            <form onSubmit={handleSubmitComment} className="space-y-3">
                                <div className="flex space-x-3">
                                    <img
                                        src={auth.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=3b82f6&color=fff`}
                                        alt={auth.user.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <textarea
                                            value={data.comment}
                                            onChange={(e) => setData('comment', e.target.value)}
                                            placeholder={`Reply to ${comment.user.name}...`}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                                            rows="2"
                                            maxLength="500"
                                        />
                                        {errors.comment && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.comment}</p>
                                        )}
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {data.comment.length}/500
                                            </span>
                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowReplyForm(null);
                                                        setData('parent_id', null);
                                                        setData('comment', '');
                                                    }}
                                                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={processing || !data.comment.trim()}
                                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {processing ? 'Replying...' : 'Reply'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    auth={auth}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onReactionToggle={onReactionToggle}
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
                                    isReply={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
