<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskStatus extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'task_statuses';

    /**
     * الحقول القابلة للتعبئة مطابقة لكراس الشروط
     */
    protected $fillable = [
        'name',       // Libellé (VARCHAR 100)
        'code',       // Code unique (VARCHAR 50)
        'sort_order', // Ordre Kanban (INT)
        'is_closed',  // Statut final (BOOLEAN)
        'is_active',  // Actif ou non (BOOLEAN)
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'sort_order' => 'integer',
        'is_closed'  => 'boolean',
        'is_active'  => 'boolean',
    ];

   
    // المهام المرتبطة بهذه الحالة
    public function tasks()
    {
        return $this->hasMany(Task::class, 'task_status_id');
    }
}