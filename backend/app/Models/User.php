<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'codigo_acceso',
        'password',
        'activo',
        'ultimo_acceso',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'ultimo_acceso'     => 'datetime',
            'activo'            => 'boolean',
            'password'          => 'hashed',
        ];
    }

    // Genera el siguiente código BIO-XXXX
    public static function generarCodigoAcceso(): string
    {
        $ultimo = self::whereNotNull('codigo_acceso')
            ->orderByDesc('id')
            ->value('codigo_acceso');

        if (!$ultimo) return 'BIO-0001';

        $numero = (int) str_replace('BIO-', '', $ultimo);
        return 'BIO-' . str_pad($numero + 1, 4, '0', STR_PAD_LEFT);
    }
}