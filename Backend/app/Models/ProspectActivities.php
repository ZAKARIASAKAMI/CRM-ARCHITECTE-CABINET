<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProspectActivity extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'prospect_activities';

    /**
     * الحقول القابلة للتعبئة (Fillable attributes)
     */
    protected $fillable = [
        'prospect_id',   // FK prospects - Prospect concerné
        'user_id',       // FK users - Auteur
        'activity_type', // Appel, note, réunion, relance
        'subject',       // Objet
        'description',   // Contenu
        'activity_at',   // Date réelle de l'activité
    ];

    /**
     * تحويل أنواع البيانات
     */
    protected $casts = [
        'activity_at' => 'datetime',
    ];

  
    // الـ Prospect المعني بالنشاط
    public function prospect()
    {
        return $this->belongsTo(Prospect::class, 'prospect_id');
    }

    // المستخدم صاحب النشاط
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}