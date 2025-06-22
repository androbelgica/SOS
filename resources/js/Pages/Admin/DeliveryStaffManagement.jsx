import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function DeliveryStaffManagement({ auth, staff, filters }) {
    // Registration form
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        phone: "",
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({
        name: "",
        email: "",
        phone: "",
        active: true,
    });
    const [search, setSearch] = useState(filters?.search || "");
    const [status, setStatus] = useState(filters?.status || "");
    const [actionLoading, setActionLoading] = useState(null); // user id for which action is loading

    // Registration submit
    const submit = (e) => {
        e.preventDefault();
        setSuccessMessage("");
        post(route("admin.delivery-staff.store"), {
            onSuccess: () => {
                setSuccessMessage(
                    "Delivery staff registered and password sent to email."
                );
                reset();
                router.reload({ only: ["staff"] });
            },
        });
    };

    // Search/filter submit
    const handleFilter = (e) => {
        e && e.preventDefault();
        router.get(
            route("admin.delivery-staff.index"),
            { search, status },
            { preserveState: true }
        );
    };

    // Edit
    const startEdit = (user) => {
        setEditId(user.id);
        setEditData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            active: !!user.active,
        });
    };
    const cancelEdit = () => {
        setEditId(null);
        setEditData({ name: "", email: "", phone: "", active: true });
    };
    const saveEdit = (user) => {
        setActionLoading(user.id);
        router.put(route("admin.delivery-staff.update", user.id), editData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditId(null);
                setActionLoading(null);
                router.reload({ only: ["staff"] });
            },
            onError: () => setActionLoading(null),
        });
    };

    // Delete
    const deleteStaff = (user) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this delivery staff?"
            )
        )
            return;
        setActionLoading(user.id);
        router.delete(route("admin.delivery-staff.destroy", user.id), {
            preserveScroll: true,
            onSuccess: () => {
                setActionLoading(null);
                router.reload({ only: ["staff"] });
            },
            onError: () => setActionLoading(null),
        });
    };

    // Toggle status
    const toggleStatus = (user) => {
        setActionLoading(user.id);
        router.post(
            route("admin.delivery-staff.toggle-status", user.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setActionLoading(null);
                    router.reload({ only: ["staff"] });
                },
                onError: () => setActionLoading(null),
            }
        );
    };

    // Reset password
    const resetPassword = (user) => {
        if (
            !window.confirm("Send a new random password to this staff's email?")
        )
            return;
        setActionLoading(user.id);
        router.post(
            route("admin.delivery-staff.reset-password", user.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setActionLoading(null);
                    alert("Password reset and sent to email.");
                },
                onError: () => setActionLoading(null),
            }
        );
    };

    return (
        <AdminLayout title="Delivery Staff Management">
            <Head title="Delivery Staff Management" />
            <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded shadow mb-10">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Register New Delivery Staff
                </h2>
                {successMessage && (
                    <div className="mb-4 text-green-600 dark:text-green-400 font-semibold">
                        {successMessage}
                    </div>
                )}
                <form onSubmit={submit} className="mb-2">
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-200 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />
                        {errors.name && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.name}
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-200 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                        />
                        {errors.email && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </div>
                        )}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-200 mb-2">
                            Phone
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            required
                        />
                        {errors.phone && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.phone}
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                        disabled={processing}
                    >
                        Register Delivery Staff
                    </button>
                </form>
            </div>

            {/* Search & Filter */}
            <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row md:items-end gap-4">
                <form onSubmit={handleFilter} className="flex gap-2 flex-1">
                    <input
                        type="text"
                        placeholder="Search by name, email, phone"
                        className="px-3 py-2 border rounded w-full dark:bg-gray-700 dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Staff List */}
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded shadow p-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                                Name
                            </th>
                            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                                Email
                            </th>
                            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                                Phone
                            </th>
                            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                                Status
                            </th>
                            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                                Date Added
                            </th>
                            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center py-6 text-gray-500 dark:text-gray-300"
                                >
                                    No delivery staff found.
                                </td>
                            </tr>
                        )}
                        {staff.data.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-gray-100 dark:border-gray-700"
                            >
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                    {editId === user.id ? (
                                        <input
                                            type="text"
                                            className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                            value={editData.name}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        user.name
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                    {editId === user.id ? (
                                        <input
                                            type="email"
                                            className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                            value={editData.email}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                    {editId === user.id ? (
                                        <input
                                            type="text"
                                            className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                            value={editData.phone}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    phone: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        user.phone
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                    {editId === user.id ? (
                                        <select
                                            className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                            value={editData.active ? "1" : "0"}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    active:
                                                        e.target.value === "1",
                                                })
                                            }
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                    ) : user.active ? (
                                        <span className="text-green-600 dark:text-green-400 font-semibold">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="text-red-500 dark:text-red-400 font-semibold">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                    {new Date(
                                        user.created_at
                                    ).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100 space-x-2">
                                    {editId === user.id ? (
                                        <>
                                            <button
                                                onClick={() => saveEdit(user)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs mr-1"
                                                disabled={
                                                    actionLoading === user.id
                                                }
                                                title="Save"
                                            >
                                                {/* Save icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs"
                                                title="Cancel"
                                            >
                                                {/* Cancel icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(user)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs mr-1"
                                                title="Edit"
                                            >
                                                {/* Edit icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    toggleStatus(user)
                                                }
                                                className={`px-2 py-1 rounded text-xs mr-1 ${
                                                    user.active
                                                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                                        : "bg-green-500 hover:bg-green-600 text-white"
                                                }`}
                                                disabled={
                                                    actionLoading === user.id
                                                }
                                                title={
                                                    user.active
                                                        ? "Deactivate"
                                                        : "Activate"
                                                }
                                            >
                                                {/* Toggle icon */}
                                                {user.active ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M18 12H6"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 12h12"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    resetPassword(user)
                                                }
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded text-xs mr-1"
                                                disabled={
                                                    actionLoading === user.id
                                                }
                                                title="Reset Password"
                                            >
                                                {/* Reset Password icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0h4m-4 0H8"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    deleteStaff(user)
                                                }
                                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                                disabled={
                                                    actionLoading === user.id
                                                }
                                                title="Delete"
                                            >
                                                {/* Delete icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                {staff.links && staff.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <nav className="flex space-x-2">
                            {staff.links.map((link, index) =>
                                link.url ? (
                                    <a
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-2 text-sm rounded transition-colors duration-200 ${
                                            link.active
                                                ? "bg-blue-500 dark:bg-blue-600 text-white"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className={`px-3 py-2 text-sm rounded transition-colors duration-200 ${
                                            link.active
                                                ? "bg-blue-500 dark:bg-blue-600 text-white"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
