<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Les Roles مع الـ slug
        $roles = [
            'Administrateur' => 'Accès complet, gestion des utilisateurs, paramètres, rôles et journaux.',
            'Architecte responsable' => 'Gestion des clients, projets, équipes, tâches, documents et planning.',
            'Collaborateur' => 'Consultation des projets affectés, mise à jour des tâches, commentaires et documents.',
            'Assistante / secrétaire' => 'Prospects, clients, rendez-vous, dossiers administratifs et relances.'
        ];

        foreach ($roles as $name => $description) {
            \App\Models\Role::firstOrCreate(
                ['name' => $name],
                [
                    'slug' => Str::slug($name),
                    'description' => $description
                ]
            );
        }

        // 2. Les Permissions
        $permissions = [
            ['name' => 'prospects.view', 'module' => 'prospects'],
            ['name' => 'prospects.create', 'module' => 'prospects'],
            ['name' => 'prospects.edit', 'module' => 'prospects'],
            ['name' => 'prospects.convert', 'module' => 'prospects'],
            
            ['name' => 'projects.view', 'module' => 'projects'],
            ['name' => 'projects.create', 'module' => 'projects'],
            ['name' => 'projects.edit', 'module' => 'projects'],
            ['name' => 'projects.delete', 'module' => 'projects'],

            ['name' => 'tasks.view', 'module' => 'tasks'],
            ['name' => 'tasks.create', 'module' => 'tasks'],
            ['name' => 'tasks.edit', 'module' => 'tasks'],

            ['name' => 'documents.view', 'module' => 'documents'],
            ['name' => 'documents.upload', 'module' => 'documents'],
            ['name' => 'documents.delete', 'module' => 'documents'],
        ];

        foreach ($permissions as $perm) {
            \App\Models\Permission::firstOrCreate(
                ['name' => $perm['name']],
                ['module' => $perm['module']]
            );
        }
    }
}