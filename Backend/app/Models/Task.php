<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'tasks';

    /**
     * الحقول القابلة للتعبئة مطابقة لجدول الصفحة 13 من كراس الشروط
     */
    protected $fillable = [
        'project_id',          // FK projects - Nullable pour tâche interne
        'parent_task_id',      // FK tasks - Sous-tâche éventuelle
        'status_id',           // FK task_statuses - Statut
        'created_by',          // FK users - Créateur
        'assigned_to',         // FK users - Responsable principal
        'title',               // Titre (VARCHAR 190)
        'description',         // Description (LONGTEXT)
        'priority',            // Priorité (low, normal, high, urgent)
        'start_date',          // Début (DATE)
        'due_date',            // Échéance (DATETIME)
        'completed_at',        // Réalisation (DATETIME)
        'estimated_hours',     // Charge estimée (DECIMAL 8,2)
        'spent_hours',         // Temps passé (DECIMAL 8,2)
        'progress_percentage', // 0 à 100 (TINYINT)
        'sort_order',          // Ordre dans le Kanban (INT)
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'start_date'          => 'date',
        'due_date'            => 'datetime',
        'completed_at'        => 'datetime',
        'estimated_hours'     => 'decimal:2',
        'spent_hours'         => 'decimal:2',
        'progress_percentage' => 'integer',
        'sort_order'          => 'integer',
        'deleted_at'          => 'datetime',
    ];

    // المشروع التابعة له المهمة (يمكن أن تكون null إذا كانت مهمة داخلية Tâche interne)
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    // المهمة الأب (في حالة كانت هذه المهمة عبارة عن Sous-tâche)
    public function parentTask()
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    // المهام الفرعية التابعة لهذه المهمة (Sub-tasks)
    public function subTasks()
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    // حالة المهمة في الـ Kanban
    public function status()
    {
        return $this->belongsTo(TaskStatus::class, 'status_id');
    }

    // منشئ المهمة
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // المكلف بالمهمة (النيابة والمسؤولية)
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}