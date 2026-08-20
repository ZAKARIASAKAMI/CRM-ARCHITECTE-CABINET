<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')->withCount('permissions')->latest()->get();

        return response()->json($roles);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:roles,name',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
            'description' => $validated['description'] ?? null,
        ]);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions(Permission::whereIn('id', $validated['permissions'])->get());
        }

        return response()->json([
            'message' => 'Rôle créé avec succès',
            'role' => $role->loadCount('users')->loadCount('permissions'),
        ], 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json($role->load('users', 'permissions'));
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100|unique:roles,name,' . $role->id,
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $role->update([
            'name' => $validated['name'] ?? $role->name,
            'description' => $validated['description'] ?? $role->description,
        ]);

        if (array_key_exists('permissions', $validated)) {
            $role->syncPermissions(
                Permission::whereIn('id', $validated['permissions'] ?? [])->get()
            );
        }

        return response()->json([
            'message' => 'Rôle mis à jour avec succès',
            'role' => $role->loadCount('users')->loadCount('permissions'),
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer un rôle attribué à des utilisateurs',
            ], 422);
        }

        $role->syncPermissions([]);
        $role->delete();

        return response()->json(['message' => 'Rôle supprimé avec succès']);
    }

    public function permissions(): JsonResponse
    {
        $permissions = Permission::orderBy('module')->orderBy('name')->get();

        return response()->json($permissions);
    }
}
