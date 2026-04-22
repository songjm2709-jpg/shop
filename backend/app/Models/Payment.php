<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'payment_key', 'method', 'status', 'amount'];

    protected $casts = ['amount' => 'integer'];

    const STATUS_PENDING = 'pending';
    const STATUS_DONE = 'done';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
