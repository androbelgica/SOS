<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Notification;
use App\Notifications\DeliveryStaffWelcomeNotification;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class DeliveryStaffController extends Controller
{
    // List, search, filter, and paginate delivery staff
    public function index(Request $request)
    {
        $query = User::where('role', 'delivery');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                    ->orWhere('phone', 'like', "%$search%");
            });
        }
        if ($status = $request->input('status')) {
            $query->where('active', $status === 'active' ? 1 : 0);
        }
        $staff = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();
        return Inertia::render('Admin/DeliveryStaffManagement', [
            'staff' => $staff,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
        ]);

        // Generate a random password
        $password = Str::random(10);

        // Create the user with role 'delivery'
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => 'delivery',
            'active' => 1,
            'password' => Hash::make($password),
        ]);

        // Send welcome notification with password
        Notification::route('mail', $user->email)
            ->notify(new DeliveryStaffWelcomeNotification($user, $password));

        return redirect()->back()->with('success', 'Delivery staff registered and password sent to email.');
    }

    // Update delivery staff info
    public function update(Request $request, User $user)
    {
        if ($user->role !== 'delivery') abort(403);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'required|string|max:20',
            'active' => 'required|boolean',
        ]);
        $user->update($validated);
        return response()->json(['success' => true, 'user' => $user]);
    }

    // Delete delivery staff
    public function destroy(User $user)
    {
        if ($user->role !== 'delivery') abort(403);
        $user->delete();
        return response()->json(['success' => true]);
    }

    // Toggle active/inactive status
    public function toggleStatus(User $user)
    {
        if ($user->role !== 'delivery') abort(403);
        $user->active = !$user->active;
        $user->save();
        return response()->json(['success' => true, 'active' => $user->active]);
    }

    // Reset password and send to email
    public function resetPassword(User $user)
    {
        if ($user->role !== 'delivery') abort(403);
        $password = Str::random(10);
        $user->password = Hash::make($password);
        $user->save();
        Notification::route('mail', $user->email)
            ->notify(new DeliveryStaffWelcomeNotification($user, $password));
        return response()->json(['success' => true]);
    }
}
