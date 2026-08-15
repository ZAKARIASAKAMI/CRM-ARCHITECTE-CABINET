<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskMember extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'task_members';

    /**
     * الحقول القابلة للتعبئة مطابقة تماماً لكراس الشروط
     */
    protected $fillable = [
        'task_id', // FK tasks - Tâche
        'user_id', // FK users - Participant
    ];

   

    // المهمة المعنية
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    // المستخدم المشارك في المهمة
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}