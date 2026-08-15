<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskComment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'task_comments';

    /**
     * الحقول القابلة للتعبئة مطابقة لكراس الشروط (الصفحة 14)
     */
    protected $fillable = [
        'task_id', // FK tasks - Tâche
        'user_id', // FK users - Auteur
        'comment', // Commentaire (LONGTEXT)
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    // المهمة المتعلق بها التعليق
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    // كاتب التعليق
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}