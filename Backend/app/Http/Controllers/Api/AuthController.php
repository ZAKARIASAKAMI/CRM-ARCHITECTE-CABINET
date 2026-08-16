<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Votre compte est inactif.'
            ], 403);
        }
        $user->update(['last_login' => now()]);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('roles.permissions'),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(
            $request->user()->load('roles.permissions')
        );
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            // Split name into first and last name
            $nameParts = explode(' ', trim($request->name), 2);
            $firstName = $nameParts[0] ?? '';
            $lastName = $nameParts[1] ?? '';

            $user = User::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $request->email,
                'password' => $request->password,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Compte créé avec succès',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user->load('roles.permissions'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du compte',
                'error' => $e->getMessage()
            ], 400);
        }
    }
}