<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskChecklistItem extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'task_checklist_items';

    /**
     * الحقول القابلة للتعبئة مطابقة تماماً لكراس الشروط
     */
    protected $fillable = [
        'task_id',      // FK tasks - Tâche
        'title',        // Élément (VARCHAR 190)
        'is_completed', // État de validation (BOOLEAN)
        'completed_by', // FK users - Auteur de la validation
        'completed_at', // Date de validation (DATETIME)
        'sort_order',   // Ordre d'affichage (INT)
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'sort_order'   => 'integer',
    ];

   

    // المهمة التابع لها هذا العنصر
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    // المستخدم الذي قام بإنهاء/تأكيد هذا العنصر
    public function validator()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}