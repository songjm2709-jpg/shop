<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['type', 'amount', 'name', 'start_date', 'end_date', 'category_id', 'is_active'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getDDayAttribute(): int
    {
        return (int) now()->diffInDays($this->end_date, false);
    }
}
