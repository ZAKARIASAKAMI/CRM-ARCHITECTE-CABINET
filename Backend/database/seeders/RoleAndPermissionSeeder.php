<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Permissions grouped by module
        $permissionsByModule = [
            'users' => [
                'users.view',
                'users.create',
                'users.edit',
                'users.delete',
            ],
            'roles' => [
                'roles.view',
                'roles.create',
                'roles.edit',
                'roles.delete',
            ],
            'permissions' => [
                'permissions.view',
                'permissions.assign',
            ],
            'settings' => [
                'settings.view',
                'settings.edit',
            ],
            'prospects' => [
                'prospects.view',
                'prospects.create',
                'prospects.edit',
                'prospects.delete',
                'prospects.convert',
            ],
            'clients' => [
                'clients.view',
                'clients.create',
                'clients.edit',
                'clients.delete',
            ],
            'projects' => [
                'projects.view',
                'projects.create',
                'projects.edit',
                'projects.delete',
            ],
            'tasks' => [
                'tasks.view',
                'tasks.create',
                'tasks.edit',
                'tasks.delete',
            ],
            'documents' => [
                'documents.view',
                'documents.upload',
                'documents.delete',
            ],
            'events' => [
                'events.view',
                'events.create',
                'events.edit',
                'events.delete',
            ],
            'comments' => [
                'comments.view',
                'comments.create',
                'comments.edit',
                'comments.delete',
            ],
            'logs' => [
                'logs.view',
            ],
        ];

        // 3. Create all permissions with module grouping
        foreach ($permissionsByModule as $module => $permissions) {
            foreach ($permissions as $permissionName) {
                Permission::firstOrCreate(
                    ['name' => $permissionName, 'guard_name' => 'web'],
                    ['module' => $module]
                );
            }
        }

        // 4. Create the 4 roles
        $admin = Role::firstOrCreate(
            ['name' => 'Administrateur', 'guard_name' => 'web'],
            ['description' => 'Accès complet: utilisateurs, paramètres, rôles, permissions et journaux.']
        );

        $architect = Role::firstOrCreate(
            ['name' => 'Architecte responsable', 'guard_name' => 'web'],
            ['description' => 'Gestion des clients, projets, équipes, tâches, documents et planning.']
        );

        $assistant = Role::firstOrCreate(
            ['name' => 'Assistante', 'guard_name' => 'web'],
            ['description' => 'Gestion des prospects, clients, rendez-vous, documents administratifs et relances.']
        );

        $collaborator = Role::firstOrCreate(
            ['name' => 'Collaborateur', 'guard_name' => 'web'],
            ['description' => 'Consultation des projets affectés, mise à jour des tâches, commentaires et documents.']
        );

        // 5. Assign permissions to each role

        // --- Administrateur: FULL ACCESS ---
        $admin->syncPermissions(Permission::all());

        // --- Architecte responsable ---
        $architect->syncPermissions([
            // Clients
            'clients.view',
            'clients.create',
            'clients.edit',
            'clients.delete',
            // Projects
            'projects.view',
            'projects.create',
            'projects.edit',
            'projects.delete',
            // Tasks
            'tasks.view',
            'tasks.create',
            'tasks.edit',
            'tasks.delete',
            // Documents
            'documents.view',
            'documents.upload',
            'documents.delete',
            // Events / Planning
            'events.view',
            'events.create',
            'events.edit',
            'events.delete',
            // Comments
            'comments.view',
            'comments.create',
            'comments.edit',
            'comments.delete',
        ]);

        // --- Assistante / Secrétaire ---
        $assistant->syncPermissions([
            // Prospects
            'prospects.view',
            'prospects.create',
            'prospects.edit',
            'prospects.convert',
            // Clients
            'clients.view',
            'clients.create',
            'clients.edit',
            // Events / Appointments
            'events.view',
            'events.create',
            'events.edit',
            'events.delete',
            // Documents (upload + view only, no delete)
            'documents.view',
            'documents.upload',
            // Comments
            'comments.view',
            'comments.create',
            'comments.edit',
        ]);

        // --- Collaborateur ---
        $collaborator->syncPermissions([
            // Projects (view only — policy restricts to assigned projects)
            'projects.view',
            // Tasks (view + edit — policy restricts to assigned tasks)
            'tasks.view',
            'tasks.edit',
            // Documents (view + upload — policy restricts to project membership)
            'documents.view',
            'documents.upload',
            // Comments
            'comments.view',
            'comments.create',
        ]);
    }
}
