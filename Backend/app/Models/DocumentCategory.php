<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class DocumentCategory extends Model
{
    use HasFactory,SoftDeletes;

    protected $table='document_categories';

    protected $fillable=[
        'name',
        'code',
        'description',
        'is_active',
        'sort_order',
    ];
    protected $casts=[
        'is_active'=>'boolean',
        'sort_order'=>'integer',
    ];

    public function documents()
    {
        return $this->hasMany(Document::class, 'document_category_id');
    }
}
