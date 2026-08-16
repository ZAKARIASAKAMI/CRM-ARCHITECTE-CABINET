<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'settings';

    /**
     * الحقول القابلة للتعبئة الجماعية (Mass Assignment)
     */
    protected $fillable = [
        'key',         // Unique key (VARCHAR 190)
        'value',       // Valeur (LONGTEXT)
        'value_type',  // string, integer, boolean, json (VARCHAR 30)
        'description', // Description (TEXT)
    ];

    /**
     * Accessor تلقائي لتحويل نوع القيمة حسب value_type عند القراءة
     */
    public function getValueAttribute($value)
    {
        return match ($this->value_type) {
            'integer', 'int' => (int) $value,
            'boolean', 'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Mutator تلقائي لتهيئ القيمة قبل الحفظ في قاعدة البيانات
     */
    public function setValueAttribute($value)
    {
        if ($this->value_type === 'json' && is_array($value)) {
            $this->attributes['value'] = json_encode($value);
        } elseif ($this->value_type === 'boolean' || $this->value_type === 'bool') {
            $this->attributes['value'] = $value ? 'true' : 'false';
        } else {
            $this->attributes['value'] = (string) $value;
        }
    }
}