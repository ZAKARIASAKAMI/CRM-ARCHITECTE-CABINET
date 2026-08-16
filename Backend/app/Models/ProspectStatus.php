<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProspectStatus extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة (Fillable attributes)
     */
    protected $fillable = [
        'name',       // Libellé (مثال: Nouveau, Contacté, Proposition, Gagné)
        'code',       // Code technique unique (مثال: new, contacted, won, lost)
        'sort_order', // Position dans le pipeline
        'is_won',     // Statut de conversion (true إذا كان الـ Prospect مكسوباً)
        'is_lost',    // Statut de perte (true إذا تم إغلاق الـ Prospect كملغي/مفقود)
        'is_active',  // Actif ou non
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     */
    protected $casts = [
        'sort_order' => 'integer',
        'is_won'     => 'boolean',
        'is_lost'    => 'boolean',
        'is_active'  => 'boolean',
    ];

  

    // الـ Prospects الموجودين حالياً في هذه المرحلة من الـ Pipeline
    public function prospects()
    {
        return $this->hasMany(Prospect::class, 'status_id');
    }
}
