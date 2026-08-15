<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LookupTablesSeeder extends Seeder
{
    public function run(): void
    {
        // Project Types
        DB::table('project_types')->insertOrIgnore([
            ['name' => 'Villa Individuelle', 'code' => 'VILLA', 'is_active' => true, 'sort_order' => 1],
            ['name' => 'Immeuble Résidentiel', 'code' => 'IMM_RES', 'is_active' => true, 'sort_order' => 2],
            ['name' => 'Bâtiment Commercial', 'code' => 'COMMERCIAL', 'is_active' => true, 'sort_order' => 3],
            ['name' => 'Rénovation / Aménagement', 'code' => 'RENOV', 'is_active' => true, 'sort_order' => 4],
        ]);

        // Project Statuses
        DB::table('project_statuses')->insertOrIgnore([
            ['name' => 'Esquisse / APS', 'code' => 'APS', 'sort_order' => 1, 'is_closed' => false, 'is_active' => true],
            ['name' => 'Projet Détaillé / APD', 'code' => 'APD', 'sort_order' => 2, 'is_closed' => false, 'is_active' => true],
            ['name' => 'Autorisation / Permis', 'code' => 'PERMIS', 'sort_order' => 3, 'is_closed' => false, 'is_active' => true],
            ['name' => 'Exécution / DCE', 'code' => 'DCE', 'sort_order' => 4, 'is_closed' => false, 'is_active' => true],
            ['name' => 'Clôturé', 'code' => 'CLOSED', 'sort_order' => 5, 'is_closed' => true, 'is_active' => true],
        ]);

        // Task Statuses
        DB::table('task_statuses')->insertOrIgnore([
            ['name' => 'À faire', 'code' => 'TODO', 'sort_order' => 1, 'is_closed' => false, 'is_active' => true],
            ['name' => 'En cours', 'code' => 'IN_PROGRESS', 'sort_order' => 2, 'is_closed' => false, 'is_active' => true],
            ['name' => 'En révision', 'code' => 'REVIEW', 'sort_order' => 3, 'is_closed' => false, 'is_active' => true],
            ['name' => 'Terminée', 'code' => 'DONE', 'sort_order' => 4, 'is_closed' => true, 'is_active' => true],
        ]);

        // Prospect Sources
        DB::table('prospect_sources')->insertOrIgnore([
            ['name' => 'Recommandation', 'is_active' => true, 'sort_order' => 1],
            ['name' => 'Site Web', 'is_active' => true, 'sort_order' => 2],
            ['name' => 'Réseaux Sociaux', 'is_active' => true, 'sort_order' => 3],
            ['name' => 'Direct / Passage', 'is_active' => true, 'sort_order' => 4],
        ]);

        // Prospect Statuses (مهمة جداً للـ Conversion Logic)
        DB::table('prospect_statuses')->insertOrIgnore([
            ['name' => 'Nouveau', 'code' => 'NEW', 'sort_order' => 1, 'is_won' => false, 'is_lost' => false, 'is_active' => true],
            ['name' => 'Contacté', 'code' => 'CONTACTED', 'sort_order' => 2, 'is_won' => false, 'is_lost' => false, 'is_active' => true],
            ['name' => 'Proposition envoyée', 'code' => 'PROPOSAL', 'sort_order' => 3, 'is_won' => false, 'is_lost' => false, 'is_active' => true],
            ['name' => 'Gagné', 'code' => 'WON', 'sort_order' => 4, 'is_won' => true, 'is_lost' => false, 'is_active' => true],
            ['name' => 'Perdu', 'code' => 'LOST', 'sort_order' => 5, 'is_won' => false, 'is_lost' => true, 'is_active' => true],
        ]);

        // Document Categories
        DB::table('document_categories')->insertOrIgnore([
            ['name' => 'Plans Architecturales', 'code' => 'PLANS', 'description' => 'Plans DWG, PDF...', 'is_active' => true, 'sort_order' => 1],
            ['name' => 'Pièces Administratives', 'code' => 'ADMIN', 'description' => 'CIN, Registre, ICE...', 'is_active' => true, 'sort_order' => 2],
            ['name' => 'Contrats et Devis', 'code' => 'CONTRACTS', 'description' => 'Documents financiers', 'is_active' => true, 'sort_order' => 3],
            ['name' => 'Rendus / Photos 3D', 'code' => 'RENDERS', 'description' => 'Images 3D et synthèses', 'is_active' => true, 'sort_order' => 4],
        ]);
    }
}