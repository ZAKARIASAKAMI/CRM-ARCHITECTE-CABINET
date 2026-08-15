<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentVersion extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'document_versions';

    /**
     * الحقول القابلة للتعبئة الجماعية (Mass Assignment)
     */
    protected $fillable = [
        'document_id',    // FK documents - Document parent
        'version_number', // Numéro de version (INT)
        'file_name',      // Nom physique du fichier (VARCHAR 255)
        'storage_disk',   // Disque de stockage (VARCHAR 50)
        'storage_path',   // Chemin du fichier (VARCHAR 500)
        'file_size',      // Taille en octets (BIGINT UNSIGNED)
        'mime_type',      // Type MIME (VARCHAR 100)
        'uploaded_by',    // FK users - Auteur de la version
        'change_note',    // Motif ou note de la version (TEXT)
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'version_number' => 'integer',
        'file_size'      => 'integer',
    ];


    // المستند الأصلي التابع له هذا الإصدار
    public function document()
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    // المستخدم الذي قام برفع هذا الإصدار
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}