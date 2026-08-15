<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectMember extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'project_members';

    /**
     * الحقول القابلة للتعبئة مطابقة تماماً لكراس الشروط
     */
    protected $fillable = [
        'project_id',   // FK projects - Projet
        'user_id',      // FK users - Collaborateur
        'project_role', // Rôle dans le projet (ex: Architecte d'intérieur, Dessinateur, Suivi chantier)
        'is_manager',   // Responsable principal (Boolean)
        'assigned_at',  // Date d’affectation
        'ended_at',     // Fin d’affectation
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'is_manager'  => 'boolean',
        'assigned_at' => 'date',
        'ended_at'    => 'date',
    ];


    // المشروع التابع له هذا العضو
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    // المستخدم / العضو المشارك في المشروع
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}