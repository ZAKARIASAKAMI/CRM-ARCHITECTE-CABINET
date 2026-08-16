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

        $admin = User::firstOrCreate(
            ['email' => 'admin@cabinet.ma'],
            [
                'first_name' => 'Admin',
                'last_name' => 'Cabinet',
                'password' => Hash::make('password123'),
                'status' => 'active',
            ]
        );

        if ($adminRole && !$admin->roles()->where('role_id', $adminRole->id)->exists()) {
            $admin->roles()->attach($adminRole->id);
        }
    }
}