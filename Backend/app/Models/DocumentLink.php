<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentLink extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'document_links';

    /**
     * الحقول القابلة للتعبئة الجماعية (Mass Assignment)
     */
    protected $fillable = [
        'document_id',   // FK documents - Document
        'linkable_type', // Modèle lié (App\Models\Project, App\Models\Task, etc.)
        'linkable_id',   // Identifiant lié (BIGINT UNSIGNED)
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'linkable_id' => 'integer',
    ];

   

    // المستند المربوط
    public function document()
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    // تربط المستند بالكيان الهدف (Prospect, Client, Project, Task, Event)
    public function linkable()
    {
        return $this->morphTo();
    }
}