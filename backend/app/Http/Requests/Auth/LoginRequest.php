<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo_acceso' => ['required', 'string', 'max:20'],
            'password'      => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo_acceso.required' => 'El código de acceso es obligatorio.',
            'password.required'      => 'La contraseña es obligatoria.',
            'password.min'           => 'La contraseña debe tener al menos 8 caracteres.',
        ];
    }
}