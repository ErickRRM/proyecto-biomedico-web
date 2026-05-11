<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Limpia caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crea los tres roles
        foreach (UserRole::values() as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // Crea usuario administrador inicial
        $admin = User::firstOrCreate(
            ['email' => 'admin@biomedico.com'],
            [
                'name'          => 'Administrador',
                'password'      => Hash::make('Admin1234!'),
                'activo'        => true,
                'ultimo_acceso' => null,
            ]
        );

        $admin->assignRole(UserRole::Admin->value);

        $this->command->info('Roles y usuario admin creados correctamente.');
        $this->command->info('Email: admin@biomedico.com');
        $this->command->info('Password: Admin1234!');
    }
}