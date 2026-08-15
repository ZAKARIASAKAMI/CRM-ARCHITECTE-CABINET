<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Prospect extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'assigned_user_id', // Responsable commercial (FK users)
        'source_id',        // Source (FK prospect_sources)
        'status_id',        // Statut courant (FK prospect_statuses)
        'client_type',      // individual ou company
        'company_name',     // Raison sociale
        'first_name',       // Prénom
        'last_name',        // Nom
        'email',            // Courriel
        'phone',            // Téléphone
        'city',             // Ville
        'address',          // Adresse
        'project_type',     // Besoin exprimé
        'estimated_budget', // Budget estimatif
        'estimated_surface',// Surface estimée
        'notes',            // Observations
        'lost_reason',      // Obligatoire si perdu
        'converted_at',     // Date de conversion
        'created_by',       // Créateur (FK users)
    ];

    /**
     * تحويل أنواع البيانات
     */
    protected $casts = [
        'estimated_budget'  => 'decimal:2',
        'estimated_surface' => 'decimal:2',
        'converted_at'      => 'datetime',
    ];


    // المسؤول التجاري المباشر
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    // المستخدم الذي أنشأ الفيش
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // مصدر الـ Prospect
    public function source()
    {
        return $this->belongsTo(ProspectSource::class, 'source_id');
    }

    // حالة الـ Prospect
    public function status()
    {
        return $this->belongsTo(ProspectStatus::class, 'status_id');
    }

    // سجل التفاعلات والأنشطة
    public function activities()
    {
        return $this->hasMany(ProspectActivity::class);
    }

    // العميل الناتج في حالة التحويل
    public function client()
    {
        return $this->hasOne(Client::class);
    }

    // المستندات المرفقة
    public function documents()
    {
        return $this->morphToMany(Document::class, 'linkable', 'document_links');
    }
}