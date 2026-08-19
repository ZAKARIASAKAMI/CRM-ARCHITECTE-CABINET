<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->get();

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:190|unique:users,email',
            'phone' => 'nullable|string|max:30',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'active' || $validated['status'] === 'true' || $validated['status'] === true;
        }
        unset($validated['status']);

        $user = User::create($validated);

        if (!empty($request->role)) {
            $role = \App\Models\Role::where('name', $request->role)->first();
            if ($role) {
                $user->roles()->attach($role);
            }
        }

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user->load('roles'),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('roles'));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|max:190|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'active' || $validated['status'] === 'true' || $validated['status'] === true;
            unset($validated['status']);
        }

        $user->update($validated);

        if ($request->has('role')) {
            $user->roles()->detach();
            $role = \App\Models\Role::where('name', $request->role)->first();
            if ($role) {
                $user->roles()->attach($role);
            }
        }

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user->load('roles'),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
