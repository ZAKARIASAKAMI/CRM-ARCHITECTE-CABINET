<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::findByName('Administrateur', 'web');
        $architectRole = Role::findByName('Architecte responsable', 'web');
        $assistantRole = Role::findByName('Assistante', 'web');
        $collaboratorRole = Role::findByName('Collaborateur', 'web');

        $users = [
            [
                'email' => 'admin@cabinet.ma',
                'first_name' => 'Admin',
                'last_name' => 'Cabinet',
                'role' => $adminRole,
            ],
            [
                'email' => 'architecte@cabinet.ma',
                'first_name' => 'Karim',
                'last_name' => 'El Hassani',
                'role' => $architectRole,
            ],
            [
                'email' => 'assistante@cabinet.ma',
                'first_name' => 'Fatima Zahra',
                'last_name' => 'El Idrissi',
                'role' => $assistantRole,
            ],
            [
                'email' => 'collaborateur@cabinet.ma',
                'first_name' => 'Youssef',
                'last_name' => 'Amrani',
                'role' => $collaboratorRole,
            ],
        ];

        foreach ($users as $data) {
            $role = $data['role'];
            unset($data['role']);

            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'password' => Hash::make('password'),
                    'status' => 'active',
                    'is_active' => true,
                ]
            );

            if ($role && !$user->hasRole($role->name, 'web')) {
                $user->assignRole($role);
            }
        }
    }
}
