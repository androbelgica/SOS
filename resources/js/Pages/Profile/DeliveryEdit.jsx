import DeliveryLayout from "@/Layouts/DeliveryLayout";
import { Head } from "@inertiajs/react";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function DeliveryEdit({ auth, mustVerifyEmail, status }) {
    return (
        <DeliveryLayout>
            <Head title="Profile" />
            <div className="py-6">
                <div className="mx-auto max-w-3xl space-y-8">
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
                </div>
            </div>
        </DeliveryLayout>
    );
}
