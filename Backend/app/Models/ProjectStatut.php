<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectStatus extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'project_statuses';

    /**
     * الحقول القابلة للتعبئة (Fillable attributes)
     */
    protected $fillable = [
        'name',        // Libellé (VARCHAR 120)
        'code',        // Code unique (VARCHAR 50)
        'description', // Description (TEXT)
        'sort_order',  // Ordre (INT)
        'is_closed',   // Projet finalisé (BOOLEAN)
        'is_active',   // Statut actif (BOOLEAN)
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'sort_order' => 'integer',
        'is_closed'  => 'boolean',
        'is_active'  => 'boolean',
    ];

    

    // المشاريع المرتبطة بهذه الحالة
    public function projects()
    {
        return $this->hasMany(Project::class, 'status_id');
    }
}