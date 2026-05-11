<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin   = 'admin';
    case Tecnico = 'tecnico';
    case Viewer  = 'viewer';

    public function label(): string
    {
        return match($this) {
            UserRole::Admin   => 'Administrador',
            UserRole::Tecnico => 'Técnico',
            UserRole::Viewer  => 'Visualizador',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}