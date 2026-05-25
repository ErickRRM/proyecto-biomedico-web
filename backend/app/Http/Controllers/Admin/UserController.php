<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('roles')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn(User $u) => $this->formatUser($u));

        return response()->json($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'codigo_acceso'  => User::generarCodigoAcceso(),
            'password'       => Hash::make($request->password),
            'activo'         => true,
        ]);

        $user->assignRole($request->rol);

        return response()->json($this->formatUser($user), 201);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::with('roles')->findOrFail($id);
        return response()->json($this->formatUser($user));
    }

    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->update([
            'name'   => $request->name,
            'email'  => $request->email,
            'activo' => $request->activo,
        ]);

        if ($request->filled('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        $user->syncRoles([$request->rol]);

        return response()->json($this->formatUser($user));
    }

    public function toggleActivo(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'No puedes desactivar tu propia cuenta.',
            ], 422);
        }

        $user->update(['activo' => !$user->activo]);

        return response()->json([
            'message' => $user->activo ? 'Usuario activado.' : 'Usuario desactivado.',
            'activo'  => $user->activo,
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'             => $user->id,
            'codigo_acceso'  => $user->codigo_acceso,
            'name'           => $user->name,
            'email'          => $user->email,
            'rol'            => $user->getRoleNames()->first(),
            'activo'         => $user->activo,
            'ultimo_acceso'  => $user->ultimo_acceso?->format('d/m/Y H:i'),
            'created_at'     => $user->created_at->format('d/m/Y'),
        ];
    }
}