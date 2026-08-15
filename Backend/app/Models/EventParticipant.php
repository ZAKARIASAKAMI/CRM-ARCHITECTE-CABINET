<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventParticipant extends Model
{
    use HasFactory;

    /**
     * اسم الجدول في قاعدة البيانات
     */
    protected $table = 'event_participants';

    /**
     * الحقول القابلة للتعبئة الجماعية (Mass Assignment)
     */
    protected $fillable = [
        'event_id',          // FK events - Événement
        'user_id',           // FK users - Participant
        'attendance_status', // Statut de présence (pending, accepted, declined)
    ];


    // الحدث / الاجتماع المربوط
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    // المستخدم المشارك
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}