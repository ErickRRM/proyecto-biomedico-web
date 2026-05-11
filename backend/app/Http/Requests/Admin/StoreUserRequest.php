<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'confirmed', Password::min(8)->letters()->numbers()->symbols()],
            'password_confirmation' => ['required'],
            'rol'                   => ['required', 'in:' . implode(',', UserRole::values())],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                  => 'El nombre es obligatorio.',
            'email.required'                 => 'El correo es obligatorio.',
            'email.unique'                   => 'Este correo ya está registrado.',
            'password.required'              => 'La contraseña es obligatoria.',
            'password.confirmed'             => 'Las contraseñas no coinciden.',
            'password_confirmation.required' => 'Debes confirmar la contraseña.',
            'rol.required'                   => 'El rol es obligatorio.',
            'rol.in'                         => 'El rol seleccionado no es válido.',
        ];
    }
}