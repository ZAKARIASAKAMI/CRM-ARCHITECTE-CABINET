<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * الحقول القابلة للتعبئة مطابقة تماماً لكراس الشروط (الصفحة 16)
     */
    protected $fillable = [
        'project_id',       // FK projects, Nullable
        'client_id',        // FK clients, Nullable
        'created_by',       // FK users - Créateur
        'title',            // Titre
        'event_type',       // Rendez-vous, réunion, visite[cite: 1]
        'description',      // Description[cite: 1]
        'location',         // Lieu[cite: 1]
        'start_at',         // Début[cite: 1]
        'end_at',           // Fin[cite: 1]
        'is_all_day',       // Toute la journée[cite: 1]
        'reminder_minutes', // Rappel[cite: 1]
        'status',           // planned, completed, cancelled[cite: 1]
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'start_at'         => 'datetime',
        'end_at'           => 'datetime',
        'is_all_day'       => 'boolean',
        'reminder_minutes' => 'integer',
    ];


    // المشروع المرتبط بهذا الحدث (إن وجد)[cite: 1]
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    // العميل المرتبط بهذا الحدث (إن وجد)[cite: 1]
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    // المستخدم الذي أنشأ الحدث[cite: 1]
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // المشاركون الداخليون في الحدث (المستخدمون)[cite: 1]
    public function participants()
    {
        return $this->belongsToMany(User::class, 'event_participants')
                    ->withPivot('attendance_status')
                    ->withTimestamps();
    }

    // المستندات والملفات المرفقة بالحدث (Polymorphic)[cite: 1]
    public function documents()
    {
        return $this->morphToMany(Document::class, 'linkable', 'document_links');
    }
}