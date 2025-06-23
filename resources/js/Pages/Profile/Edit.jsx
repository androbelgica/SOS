import React from "react";
import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <MainLayout auth={auth} title="My Profile">
            <Head title="Profile" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-4xl"
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
                        <UpdatePasswordForm className="max-w-4xl" />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
                        <DeleteUserForm className="max-w-4xl" />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
