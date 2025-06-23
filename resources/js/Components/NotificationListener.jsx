import React from 'react';
import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import toast from "react-hot-toast";

export default function NotificationListener() {
    const { auth } = usePage().props;

    useEffect(() => {
        if (!auth?.user?.id) return;

        // Listen for recipe status changes
        window.Echo.private(`user.${auth.user.id}`)
            .listen(".RecipeStatusChanged", (e) => {
                toast(e.message || `Recipe status updated: ${e.status}`);
            })
            .listen(".OrderStatusChanged", (e) => {
                toast(e.message || `Order status updated: ${e.status}`);
            });

        // Cleanup on unmount
        return () => {
            window.Echo.leave(`user.${auth.user.id}`);
        };
    }, [auth?.user?.id]);

    return null;
}
