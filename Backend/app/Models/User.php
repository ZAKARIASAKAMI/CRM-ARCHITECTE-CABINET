<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'avatar',
        'statut',
        'last_login',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * تحويل أنواع البيانات (Casting attributes)
     */
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

   
    // المشاريع التي يتولى إدارتها كمهندس مسؤول
    public function managedProjects()
    {
        return $this->hasMany(Project::class, 'manager_user_id');
    }

    // المشاريع المشارك فيها كعضو فريق
    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_members')
                    ->withPivot('project_role', 'is_manager', 'assigned_at', 'ended_at')
                    ->withTimestamps();
    }

    // المهام المسندة إليه كمسؤول رئيسي
    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    // المهام المشارك فيها كعضو إضافي
    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_members');
    }

    // الـ Prospects المسندة إليه لمتابعتها
    public function assignedProspects()
    {
        return $this->hasMany(Prospect::class, 'assigned_user_id');
    }

    // الأحداث والاجتماعات المشارك فيها
    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_participants')
                    ->withPivot('attendance_status')
                    ->withTimestamps();
    }

    // المستندات التي قام برفعها
    public function uploadedDocuments()
    {
        return $this->hasMany(Document::class, 'uploaded_by');
    }

    // سجل الأنشطة التي قام بها
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }
public function roles(): BelongsToMany
{
    return $this->belongsToMany(Role::class, 'role_user');
}
}
