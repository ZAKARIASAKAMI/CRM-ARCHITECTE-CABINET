<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * الحقول القابلة للتعبئة مطابقة تماماً لكراس الشروط (الصفحات 8-9)
     */
    protected $fillable = [
        'client_type',    // individual ou company
        'company_name',   // Raison sociale
        'first_name',     // Prénom
        'last_name',      // Nom[cite: 1]
        'email',          // Courriel[cite: 1]
        'phone',          // Téléphone[cite: 1]
        'ice',            // Identifiant commun de l’entreprise (ICE)[cite: 1]
        'tax_identifier', // Identifiant fiscal (IF)[cite: 1]
        'trade_register', // Registre de commerce (RC)[cite: 1]
        'address',        // Adresse[cite: 1]
        'city',           // Ville[cite: 1]
        'country',        // Pays, Maroc par défaut[cite: 1]
        'notes',          // Observations[cite: 1]
        'prospect_id',    // Prospect d’origine, nullable (FK prospects)[cite: 1]
        'created_by',     // Créateur (FK users)[cite: 1]
    ];


    // الـ Prospect الأصلي الذي تم تحويله إلى هذا العميل (إن وجد)[cite: 1]
    public function prospect()
    {
        return $this->belongsTo(Prospect::class, 'prospect_id');
    }

    // المستخدم الذي قام بإضافة العميل[cite: 1]
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // جهات الاتصال الخاصة بالعميل (خاصة الشركات - 1 to Many)[cite: 1]
    public function contacts()
    {
        return $this->hasMany(ClientContact::class, 'client_id');
    }

    // المشاريع الخاصة بهذا العميل (1 to Many)[cite: 1]
    public function projects()
    {
        return $this->hasMany(Project::class, 'client_id');
    }

    // الإشعار / المواعيد واللقاءات الخاصة بالعميل (1 to Many)[cite: 1]
    public function events()
    {
        return $this->hasMany(Event::class, 'client_id');
    }

    // الوثائق والمستندات المرفقة بالعميل (Polymorphic)[cite: 1]
    public function documents()
    {
        return $this->morphToMany(Document::class, 'linkable', 'document_links');
    }
}