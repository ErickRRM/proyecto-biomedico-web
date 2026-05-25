<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('codigo_acceso', $request->codigo_acceso)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'codigo_acceso' => ['El código de acceso o la contraseña son incorrectos.'],
            ]);
        }

        if (! $user->activo) {
            return response()->json([
                'message' => 'Tu cuenta está desactivada. Contacta al administrador.',
            ], 403);
        }

        $user->update(['ultimo_acceso' => now()]);
        $user->tokens()->where('name', 'auth_token')->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'            => $user->id,
                'codigo_acceso' => $user->codigo_acceso,
                'nombre'        => $user->name,
                'email'         => $user->email,
                'rol'           => $user->getRoleNames()->first(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id'            => $user->id,
            'codigo_acceso' => $user->codigo_acceso,
            'nombre'        => $user->name,
            'email'         => $user->email,
            'rol'           => $user->getRoleNames()->first(),
        ]);
    }
}