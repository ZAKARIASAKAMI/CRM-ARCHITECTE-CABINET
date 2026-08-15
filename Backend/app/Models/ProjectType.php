<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectType extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'project_types';

    /**
     * الحقول القابلة للتعبئة (Fillable attributes)
     */
    protected $fillable = [
        'name',        // Libellé (ex: Villa Individuelle, Immeuble R+4)
        'code',        // Code technique unique (ex: villa, residential_building)
        'description', // Description du type de projet
        'sort_order',  // Ordre d'affichage
        'is_active',   // Actif ou non
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'sort_order' => 'integer',
        'is_active'  => 'boolean',
    ];

   

    // المشاريع المندرجة تحت هذا النوع (1 to Many)
    public function projects()
    {
        return $this->hasMany(Project::class, 'project_type_id');
    }
}