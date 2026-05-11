<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'max:255', "unique:users,email,{$userId}"],
            'password'              => ['nullable', 'confirmed', Password::min(8)->letters()->numbers()->symbols()],
            'password_confirmation' => ['nullable', 'required_with:password'],
            'rol'                   => ['required', 'in:' . implode(',', UserRole::values())],
            'activo'                => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                       => 'El nombre es obligatorio.',
            'email.required'                      => 'El correo es obligatorio.',
            'email.unique'                        => 'Este correo ya está registrado.',
            'password.confirmed'                  => 'Las contraseñas no coinciden.',
            'password_confirmation.required_with' => 'Debes confirmar la nueva contraseña.',
            'rol.required'                        => 'El rol es obligatorio.',
            'rol.in'                              => 'El rol seleccionado no es válido.',
        ];
    }
}