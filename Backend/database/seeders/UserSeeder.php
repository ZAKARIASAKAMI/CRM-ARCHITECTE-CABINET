<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'Administrateur')->first();
        $architectRole = Role::where('name', 'Architecte responsable')->first();
        $collabRole = Role::where('name', 'Collaborateur')->first();
        $assistRole = Role::where('name', 'Assistante / secrétaire')->first();

        $users = [
            [
                'email' => 'admin@cabinet.ma',
                'first_name' => 'Admin',
                'last_name' => 'Cabinet',
                'role' => $adminRole,
            ],
            [
                'email' => 'karim.elhassani@cabinet.ma',
                'first_name' => 'Karim',
                'last_name' => 'El Hassani',
                'role' => $architectRole,
            ],
            [
                'email' => 'sara.bennani@cabinet.ma',
                'first_name' => 'Sara',
                'last_name' => 'Bennani',
                'role' => $architectRole,
            ],
            [
                'email' => 'youssef.amrani@cabinet.ma',
                'first_name' => 'Youssef',
                'last_name' => 'Amrani',
                'role' => $collabRole,
            ],
            [
                'email' => 'fatima.zahra@cabinet.ma',
                'first_name' => 'Fatima Zahra',
                'last_name' => 'El Idrissi',
                'role' => $assistRole,
            ],
            [
                'email' => 'mehdi.tazi@cabinet.ma',
                'first_name' => 'Mehdi',
                'last_name' => 'Tazi',
                'role' => $collabRole,
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
                    'password' => Hash::make('password123'),
                    'status' => 'active',
                ]
            );

            if ($role && !$user->roles()->where('role_id', $role->id)->exists()) {
                $user->roles()->attach($role->id);
            }
        }
    }
}