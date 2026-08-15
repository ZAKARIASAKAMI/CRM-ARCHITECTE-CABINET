<?php
namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProspectSource extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة (Fillable attributes)
     */
    protected $fillable = [
        'name',       // اسم المصدر (مثال: الموقع الإلكتروني، توصية، الإعلانات...)
        'is_active',  // حالة تفعيل المصدر (متاح للاختيار أم لا)
        'sort_order', // ترتيب العرض في القوائم
    ];

    /**
     * تحويل البيانات (Casting)
     */
    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    

    // الـ Prospects المرتبطين بهذا المصدر (1 to Many)
    public function prospects()
    {
        return $this->hasMany(Prospect::class, 'source_id');
    }
}