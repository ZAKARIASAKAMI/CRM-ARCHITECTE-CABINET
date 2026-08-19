<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'documents';

    /**
     * الحقول القابلة للتعبئة الجماعية (Mass Assignment)
     */
    protected $fillable = [
        'folder_id',       // FK folders - Dossier
        'category_id',     // FK document_categories - Catégorie
        'uploaded_by',      // FK users - Auteur du premier dépôt
        'name',            // Nom fonctionnel (VARCHAR 190)
        'original_name',   // Nom d’origine (VARCHAR 255)
        'description',     // Description (TEXT)
        'current_version', // Version courante (INT)
        'extension',        // Extension (VARCHAR 20)
        'mime_type',        // Type MIME (VARCHAR 100)
        'file_size',        // Taille en octets (BIGINT UNSIGNED)
        'storage_disk',    // local, s3, minio (VARCHAR 50)
        'storage_path',    // Chemin interne (VARCHAR 500)
        'is_archived',     // Archivé (BOOLEAN)
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'current_version' => 'integer',
        'file_size'       => 'integer',
        'is_archived'     => 'boolean',
        'deleted_at'      => 'datetime',
    ];

    // المجلد التابع له المستند
    public function folder()
    {
        return $this->belongsTo(Folder::class, 'folder_id');
    }

    // تصنيف المستند (Plan, Contrat, Permis, etc.)
    public function category()
    {
        return $this->belongsTo(DocumentCategory::class, 'category_id');
    }

    // المستخدم الذي قام برفع المستند لأول مرة
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // جميع النسخ والإصدارات التاريخية للمستند (1 to Many)
    public function versions()
    {
        return $this->hasMany(DocumentVersion::class, 'document_id');
    }

    public function currentVersion()
    {
        return $this->hasOne(DocumentVersion::class, 'document_id')->latestOfMany('version_number');
    }

    public function links()
    {
        return $this->hasMany(DocumentLink::class, 'document_id');
    }

    public function projects()
    {
        return $this->morphedByMany(Project::class, 'linkable', 'document_links');
    }
}