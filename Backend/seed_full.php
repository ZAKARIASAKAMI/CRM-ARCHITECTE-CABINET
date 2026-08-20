<?php
require __DIR__."/vendor/autoload.php";
$app = require_once __DIR__."/bootstrap/app.php";
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

DB::statement('SET NAMES utf8mb4');

$admin = App\Models\User::where("email", "admin@cabinet.ma")->first();
$architect = App\Models\User::where("email", "architect@cabinet.ma")->first();
$collaborator = App\Models\User::where("email", "collaborator@cabinet.ma")->first();

$client = DB::table("clients")->insertGetId([
    "first_name" => "Mohammed", "last_name" => "Benali", "email" => "mohammed@example.com",
    "phone" => "+212600000001", "client_type" => "individual",
    "created_at" => now(), "updated_at" => now(),
]);

$typeId = DB::table("project_types")->first()->id ?? 1;
$statusId = DB::table("project_statuses")->first()->id ?? 1;

$projects = [
    ["name" => "Villa Les Palmiers", "reference" => "PRJ-2026-001", "client_id" => $client, "project_type_id" => $typeId, "project_status_id" => $statusId, "city" => "Casablanca", "priority" => "high", "description" => "Villa moderne 350m2"],
    ["name" => "Residence Al Andalous", "reference" => "PRJ-2026-002", "client_id" => $client, "project_type_id" => $typeId, "project_status_id" => $statusId, "city" => "Rabat", "priority" => "normal", "description" => "Residence 24 appartements"],
    ["name" => "Bureau Technopark", "reference" => "PRJ-2026-003", "client_id" => $client, "project_type_id" => $typeId, "project_status_id" => $statusId, "city" => "Casablanca", "priority" => "urgent", "description" => "Immeuble de bureaux 8 etages"],
    ["name" => "Villa Jardin Royal", "reference" => "PRJ-2026-004", "client_id" => $client, "project_type_id" => $typeId, "project_status_id" => $statusId, "city" => "Marrakech", "priority" => "normal", "description" => "Villa traditionnelle"],
];

$projectIds = [];
foreach ($projects as $p) {
    $p["created_by"] = $admin->id;
    $p["manager_user_id"] = $architect->id;
    $p["created_at"] = now();
    $p["updated_at"] = now();
    $projectIds[] = DB::table("projects")->insertGetId($p);
}

foreach ($projectIds as $pid) {
    DB::table("project_members")->insert([
        "project_id" => $pid, "user_id" => $collaborator->id, "project_role" => "collaborateur",
        "is_manager" => false, "assigned_at" => now(), "created_at" => now(), "updated_at" => now(),
    ]);
}

$statusTaskId = DB::table("task_statuses")->first()->id ?? 1;
$tasks = [
    ["title" => "Etude de sol Villa Les Palmiers", "project_id" => $projectIds[0], "status_id" => $statusTaskId, "created_by" => $architect->id, "assigned_to" => $collaborator->id, "priority" => "high"],
    ["title" => "Plans cadastraux Residence", "project_id" => $projectIds[1], "status_id" => $statusTaskId, "created_by" => $architect->id, "assigned_to" => $collaborator->id, "priority" => "normal"],
    ["title" => "Permis de construire Technopark", "project_id" => $projectIds[2], "status_id" => $statusTaskId, "created_by" => $admin->id, "assigned_to" => $architect->id, "priority" => "urgent"],
    ["title" => "Rendu 3D Villa Jardin", "project_id" => $projectIds[3], "status_id" => $statusTaskId, "created_by" => $architect->id, "assigned_to" => $architect->id, "priority" => "normal"],
];

$taskIds = [];
foreach ($tasks as $t) {
    $t["created_at"] = now();
    $t["updated_at"] = now();
    $taskIds[] = DB::table("tasks")->insertGetId($t);
}

foreach (array_slice($taskIds, 0, 2) as $tid) {
    DB::table("task_members")->insert([
        "task_id" => $tid, "user_id" => $collaborator->id, "created_at" => now(), "updated_at" => now(),
    ]);
}

$folderNames = ["Plans", "Contrats", "Correspondance", "Permis"];
foreach ($projectIds as $pid) {
    foreach ($folderNames as $fname) {
        DB::table("folders")->insert([
            "name" => $fname, "project_id" => $pid, "created_at" => now(), "updated_at" => now(),
        ]);
    }
}

$folders = DB::table("folders")->get();
$docs = [
    ["name" => "Plan de masse"],
    ["name" => "Contrat de maitrise"],
    ["name" => "Permis de construire"],
    ["name" => "Rapport geotechnique"],
];
foreach ($docs as $i => $d) {
    $folder = $folders[$i % $folders->count()];
    DB::table("documents")->insert([
        "name" => $d["name"], "original_name" => strtolower(str_replace(" ", "_", $d["name"])) . ".pdf",
        "folder_id" => $folder->id, "uploaded_by" => $admin->id,
        "current_version" => 1, "extension" => "pdf", "mime_type" => "application/pdf",
        "file_size" => 1024, "storage_disk" => "local", "storage_path" => "documents/test.pdf",
        "created_at" => now(), "updated_at" => now(),
    ]);
}

echo "Done: " . count($projectIds) . " projects, " . count($taskIds) . " tasks, " . DB::table("folders")->count() . " folders, " . DB::table("documents")->count() . " docs" . PHP_EOL;
