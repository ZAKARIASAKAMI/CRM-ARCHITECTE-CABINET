<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'projects';

    /**
     * الحقول القابلة للتعبئة مطابقة لجدول الصفحة 11 من كراس الشروط
     */
    protected $fillable = [
        'client_id',               // FK clients - Client
        'project_type_id',         // FK project_types - Type
        'project_status_id',       // FK project_statuses - Statut
        'manager_user_id',         // FK users - Architecte responsable
        'reference',               // Reference unique (ex: PRJ-2026-001)
        'name',                    // Nom du projet
        'description',             // Description longue
        'priority',                // low, normal, high, urgent
        'city',                    // Ville
        'address',                 // Adresse
        'latitude',                // Coordonnée GPS
        'longitude',               // Coordonnée GPS
        'land_surface',            // Surface du terrain
        'estimated_built_surface', // Surface construite estimée
        'estimated_budget',        // Budget estimatif
        'start_date',              // Début
        'expected_end_date',       // Fin prévisionnelle
        'actual_end_date',         // Fin réelle
        'progress_percentage',     // 0 à 100
        'notes',                   // Observations
        'created_by',              // FK users - Créateur
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'latitude'                => 'decimal:7',
        'longitude'               => 'decimal:7',
        'land_surface'            => 'decimal:2',
        'estimated_built_surface' => 'decimal:2',
        'estimated_budget'        => 'decimal:2',
        'start_date'              => 'date',
        'expected_end_date'       => 'date',
        'actual_end_date'         => 'date',
        'progress_percentage'     => 'integer',
        'deleted_at'              => 'datetime',
    ];


    // العميل صاحب المشروع
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    // نوع المشروع (Villa, Immeuble, ...)
    public function type()
    {
        return $this->belongsTo(ProjectType::class, 'project_type_id');
    }

    // حالة المشروع (En étude, En chantier, ...)
    public function status()
    {
        return $this->belongsTo(ProjectStatus::class, 'project_status_id');
    }

    // المهندس المعماري المسؤول عن المشروع
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_user_id');
    }

    // مستخدم المنظومة الذي أنشأ السجل
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // أعضاء فريق العمل في المشروع (جدول وسيط project_members)
    public function members()
    {
        return $this->belongsToMany(User::class, 'project_members', 'project_id', 'user_id')
                    ->withPivot('project_role', 'is_manager', 'assigned_at', 'ended_at')
                    ->withTimestamps();
    }

    public function statusHistories()
    {
        return $this->hasMany(ProjectStatusHistory::class, 'project_id');
    }

    // الأحداث والمواعيد المرتبطة بالمشروع
    public function events()
    {
        return $this->hasMany(Event::class, 'project_id');
    }

    // المستندات والرسومات الهندسية المرتبطة بالمشروع
    public function documents()
    {
        return $this->morphToMany(Document::class, 'linkable', 'document_links');
    }
}