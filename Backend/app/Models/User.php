<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'avatar_path',
        'status',
        'is_active',
        'last_login',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // --- Relations ---

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function managedProjects()
    {
        return $this->hasMany(Project::class, 'manager_user_id');
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_members')
                    ->withPivot('project_role', 'is_manager', 'assigned_at', 'ended_at')
                    ->withTimestamps();
    }

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_members');
    }

    public function assignedProspects()
    {
        return $this->hasMany(Prospect::class, 'assigned_user_id');
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_participants')
                    ->withPivot('attendance_status')
                    ->withTimestamps();
    }

    public function uploadedDocuments()
    {
        return $this->hasMany(Document::class, 'uploaded_by');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }

 
public function hasPermission(string $permissionName): bool
{
    return $this->roles()->whereHas('permissions', function ($query) use ($permissionName) {
        $query->where('name', $permissionName);
    })->exists();
}
}