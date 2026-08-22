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
                'projects.view_assigned',
                'projects.create',
                'projects.edit',
                'projects.delete',
            ],
            'tasks' => [
                'tasks.view',
                'tasks.view_assigned',
                'tasks.create',
                'tasks.edit',
                'tasks.delete',
                'tasks.update_status',
                'tasks.update_progress',
                'tasks.log_time',
                'tasks.check_items',
            ],
            'documents' => [
                'documents.view',
                'documents.upload',
                'documents.edit',
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

        // --- Administrator: Global full access (*) ---
        $admin = Role::firstOrCreate(
            ['name' => 'Administrator', 'guard_name' => 'web'],
            ['description' => 'Global full access to all modules, users, settings, and system logs.']
        );

        // --- Architect: Business & project scope ---
        $architect = Role::firstOrCreate(
            ['name' => 'Architect', 'guard_name' => 'web'],
            ['description' => 'CRUD on projects, tasks, schedules, teams, documents, and clients.']
        );

        // --- Collaborator: Restricted to assigned records only ---
        $collaborator = Role::firstOrCreate(
            ['name' => 'Collaborator', 'guard_name' => 'web'],
            ['description' => 'View assigned projects and tasks only. Comment on own records.']
        );

        // --- Secretary: CRM and administrative scope ---
        $secretary = Role::firstOrCreate(
            ['name' => 'Secretary', 'guard_name' => 'web'],
            ['description' => 'Manage prospects, clients, appointments, reminders, and administrative documents.']
        );

        // 5. Assign permissions to each role

        // --- Administrator: FULL ACCESS ---
        $admin->syncPermissions(Permission::all());

        // --- Architect: CRUD on projects, tasks, schedules, teams, documents, clients ---
        $architect->syncPermissions([
            // Clients
            'clients.view',
            'clients.create',
            'clients.edit',
            'clients.delete',
            // Projects
            'projects.view',
            'projects.view_assigned',
            'projects.create',
            'projects.edit',
            'projects.delete',
            // Tasks
            'tasks.view',
            'tasks.view_assigned',
            'tasks.create',
            'tasks.edit',
            'tasks.delete',
            'tasks.update_status',
            'tasks.update_progress',
            'tasks.log_time',
            'tasks.check_items',
            // Documents
            'documents.view',
            'documents.upload',
            'documents.edit',
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

        // --- Collaborator: Assigned records only (policy restricts scope) ---
        $collaborator->syncPermissions([
            // Projects (view assigned only)
            'projects.view_assigned',
            // Tasks (view assigned + granular actions)
            'tasks.view_assigned',
            'tasks.update_status',
            'tasks.update_progress',
            'tasks.log_time',
            'tasks.check_items',
            // Comments
            'comments.view',
            'comments.create',
        ]);

        // --- Secretary: CRM + Administrative scope ---
        $secretary->syncPermissions([
            // Prospects (no delete)
            'prospects.view',
            'prospects.create',
            'prospects.edit',
            'prospects.convert',
            // Clients (no delete)
            'clients.view',
            'clients.create',
            'clients.edit',
            // Events / Appointments
            'events.view',
            'events.create',
            'events.edit',
            'events.delete',
            // Documents (view + upload only, no delete)
            'documents.view',
            'documents.upload',
            // Comments
            'comments.view',
            'comments.create',
            'comments.edit',
        ]);
    }
}
