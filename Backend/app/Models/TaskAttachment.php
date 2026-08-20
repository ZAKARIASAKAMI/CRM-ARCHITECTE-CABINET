<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskAttachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'task_attachments';

    protected $fillable = [
        'task_id',
        'uploaded_by',
        'name',
        'original_name',
        'extension',
        'mime_type',
        'file_size',
        'storage_disk',
        'storage_path',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'deleted_at' => 'datetime',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
