<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'CRM Architecture API',
        'version' => '2.0.0',
        'status' => 'OK',
        'documentation' => [
            'auth' => [
                'POST /api/login' => 'Connexion (email + password)',
                'POST /api/register' => 'Créer un compte',
                'GET /api/me' => 'Utilisateur courant (auth:sanctum)',
                'POST /api/logout' => 'Déconnexion',
            ],
            'prospects' => [
                'GET /api/prospects' => 'Lister les prospects (permission: prospects.view)',
                'POST /api/prospects' => 'Créer un prospect (permission: prospects.create)',
                'GET /api/prospects/{id}' => 'Détail d\'un prospect',
                'PUT /api/prospects/{id}' => 'Modifier un prospect',
                'DELETE /api/prospects/{id}' => 'Supprimer un prospect',
                'POST /api/prospects/{id}/convert' => 'Convertir en client (permission: prospects.convert)',
            ],
            'clients' => [
                'GET /api/clients' => 'Lister les clients (permission: clients.view)',
                'POST /api/clients' => 'Créer un client',
                'GET /api/clients/{id}' => 'Détail d\'un client',
                'PUT /api/clients/{id}' => 'Modifier un client',
                'DELETE /api/clients/{id}' => 'Supprimer un client',
            ],
            'projects' => [
                'GET /api/projects' => 'Lister les projets (permission: projects.view)',
                'POST /api/projects' => 'Créer un projet',
                'GET /api/projects/{id}' => 'Détail d\'un projet',
                'PUT /api/projects/{id}' => 'Modifier un projet',
                'DELETE /api/projects/{id}' => 'Supprimer un projet',
            ],
            'tasks' => [
                'GET /api/tasks' => 'Lister les tâches (permission: tasks.view)',
                'POST /api/tasks' => 'Créer une tâche',
                'GET /api/tasks/{id}' => 'Détail d\'une tâche',
                'PUT /api/tasks/{id}' => 'Modifier une tâche',
                'DELETE /api/tasks/{id}' => 'Supprimer une tâche',
            ],
            'roles' => [
                'GET /api/roles' => 'Lister les rôles (role: Administrateur)',
                'POST /api/roles' => 'Créer un rôle',
                'GET /api/roles/{id}' => 'Détail d\'un rôle',
                'PUT /api/roles/{id}' => 'Modifier un rôle',
                'DELETE /api/roles/{id}' => 'Supprimer un rôle',
                'GET /api/permissions' => 'Lister les permissions',
            ],
        ],
    ]);
});
