<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log_activities extends Model
{
    protected $fillable = [
        'user_id',
        'log_name',
        'event',
        'subject_type',
        'subject_id',
        'description',
        'properties',
        'ip_address',
        'user_agent',
        'created_at',
    ];
    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    // العلاقة مع المستخدم صاحب الإجراء
    public function causer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // العلاقة Polymorphic مع العنصر المستهدف (Project, Task, Client...)
    public function subject()
    {
        return $this->morphTo();
    }
}
