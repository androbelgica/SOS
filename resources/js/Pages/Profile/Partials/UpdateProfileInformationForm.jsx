import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const [photoPreview, setPhotoPreview] = useState(null);
    const photoInput = useRef(null);

    const { data, setData, patch, errors, processing, recentlySuccessful, reset } =
        useForm({
            name: user.name,
            email: user.email,
            address: user.address || '',
            phone: user.phone || '',
            city: user.city || '',
            state: user.state || '',
            postal_code: user.postal_code || '',
            country: user.country || '',
            avatar: null,
        });

    const selectNewPhoto = () => {
        photoInput.current.click();
    };

    const updatePhotoPreview = () => {
        const photo = photoInput.current.files[0];
        if (!photo) return;

        setData('avatar', photo);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(photo);
    };

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                if (photoInput.current) {
                    photoInput.current.value = '';
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6" encType="multipart/form-data">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Photo */}
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Photo</h3>
                    <div className="mt-2 flex items-center space-x-6">
                        <div className="flex-shrink-0">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Profile preview"
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            ) : user.avatar ? (
                                <img
                                    src={`/storage/${user.avatar}`}
                                    alt={user.name}
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                    <svg
                                        className="h-10 w-10 text-gray-400 dark:text-gray-300"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <button
                                type="button"
                                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium leading-4 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                onClick={selectNewPhoto}
                            >
                                Change Photo
                            </button>
                            <input
                                type="file"
                                className="hidden"
                                ref={photoInput}
                                onChange={updatePhotoPreview}
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                JPG, PNG, GIF up to 1MB
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Contact Information</h3>

                    <div className="mt-4">
                        <InputLabel htmlFor="phone" value="Phone Number" />
                        <TextInput
                            id="phone"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                        />
                        <InputError className="mt-2" message={errors.phone} />
                    </div>
                </div>

                {/* Address Information */}
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Address Information</h3>

                    <div className="mt-4">
                        <InputLabel htmlFor="address" value="Street Address" />
                        <TextInput
                            id="address"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            autoComplete="street-address"
                        />
                        <InputError className="mt-2" message={errors.address} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="city" value="City" />
                            <TextInput
                                id="city"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                autoComplete="address-level2"
                            />
                            <InputError className="mt-2" message={errors.city} />
                        </div>

                        <div>
                            <InputLabel htmlFor="state" value="State / Province" />
                            <TextInput
                                id="state"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.state}
                                onChange={(e) => setData('state', e.target.value)}
                                autoComplete="address-level1"
                            />
                            <InputError className="mt-2" message={errors.state} />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="postal_code" value="Postal Code" />
                            <TextInput
                                id="postal_code"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.postal_code}
                                onChange={(e) => setData('postal_code', e.target.value)}
                                autoComplete="postal-code"
                            />
                            <InputError className="mt-2" message={errors.postal_code} />
                        </div>

                        <div>
                            <InputLabel htmlFor="country" value="Country" />
                            <TextInput
                                id="country"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.country}
                                onChange={(e) => setData('country', e.target.value)}
                                autoComplete="country-name"
                            />
                            <InputError className="mt-2" message={errors.country} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
