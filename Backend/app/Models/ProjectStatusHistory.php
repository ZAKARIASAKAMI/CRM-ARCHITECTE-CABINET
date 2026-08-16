<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectStatusHistory extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'project_status_histories';

    /**
     * لا داعي لاستخدام timestamps التلقائية (created_at/updated_at) 
     * لأن التاريخ مسجل بوضوح في حقل changed_at
     */
    public $timestamps = false;

    /**
     * الحقول القابلة للتعبئة مطابقة لجدول الصفحة 12 من كراس الشروط
     */
    protected $fillable = [
        'project_id',    // FK projects - Projet
        'old_status_id', // FK project_statuses - Ancien statut
        'new_status_id', // FK project_statuses - Nouveau statut
        'changed_by',    // FK users - Auteur du changement
        'comment',       // Motif ou note (TEXT)
        'changed_at',    // Date du changement
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'changed_at' => 'datetime',
    ];

    

    // المشروع المعني بتغيير الحالة
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    // الحالة السابقة للمشروع
    public function oldStatus()
    {
        return $this->belongsTo(ProjectStatus::class, 'old_status_id');
    }

    // الحالة الجديدة للمشروع
    public function newStatus()
    {
        return $this->belongsTo(ProjectStatus::class, 'new_status_id');
    }

    // المستخدم الذي قام بتغيير الحالة
    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}