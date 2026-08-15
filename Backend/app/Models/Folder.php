<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    protected $table = 'folders';

    protected $fillable = [
        'project_id',
        'parent_id',
        'name',
        'description',
        'created_by',
    ];
    protected $casts = [
       'deleted_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    } 
    public function parent()
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    // المجلدات الفرعية (Sub-folders)
    public function children()
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    // المستخدم الذي أنشأ المجلد
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // الوثائق والمستندات داخل هذا المجلد
    public function documents()
    {
        return $this->hasMany(Document::class, 'folder_id');
    }
}
