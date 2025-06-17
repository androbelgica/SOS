import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import axios from 'axios';

export default function NotificationsIndex({ auth, notifications }) {
    const [notificationList, setNotificationList] = useState(notifications.data);

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/notifications/${notificationId}/mark-read`);
            setNotificationList(notificationList.map(n => 
                n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            setNotificationList(notificationList.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            try {
                await axios.delete(`/notifications/${notificationId}`);
                setNotificationList(notificationList.filter(n => n.id !== notificationId));
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        }
    };

    const clearReadNotifications = async () => {
        if (confirm('Are you sure you want to clear all read notifications?')) {
            try {
                await axios.post('/notifications/clear-read');
                setNotificationList(notificationList.filter(n => !n.read_at));
            } catch (error) {
                console.error('Error clearing read notifications:', error);
            }
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.type === 'recipe_approved' || notification.type === 'recipe_rejected' || notification.type === 'recipe_under_review') {
            router.visit(`/my/recipes/${notification.data.recipe_id}`);
        } else if (notification.type === 'recipe_submitted' && auth.user.role === 'admin') {
            router.visit(`/admin/recipes`);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'recipe_approved':
                return (
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'recipe_rejected':
                return (
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'recipe_submitted':
                return (
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                );
            case 'recipe_under_review':
                return (
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    const unreadCount = notificationList.filter(n => !n.read_at).length;

    return (
        <MainLayout auth={auth}>
            <Head title="Notifications" />
            
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                        >
                                            Mark All Read
                                        </button>
                                    )}
                                    <button
                                        onClick={clearReadNotifications}
                                        className="bg-gray-500 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Clear Read
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        {notificationList.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25a2.25 2.25 0 0 0 2.25 2.25H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h2.25A2.25 2.25 0 0 0 7.5 12V9.75a6 6 0 0 1 6-6Z" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">You're all caught up! Check back later for updates.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {notificationList.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                            !notification.read_at ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start space-x-4">
                                            {getNotificationIcon(notification.type)}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                            {formatTimeAgo(notification.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {!notification.read_at && (
                                                            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {notifications.links && notifications.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="flex space-x-2">
                                {notifications.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-2 text-sm rounded transition-colors duration-200 ${
                                            link.active
                                                ? 'bg-blue-500 dark:bg-blue-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
