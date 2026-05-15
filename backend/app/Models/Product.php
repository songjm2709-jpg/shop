<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'name', 'description', 'price', 'original_price', 'is_new', 'stock', 'image'];

    protected $casts = [
        'price'          => 'integer',
        'original_price' => 'integer',
        'stock'          => 'integer',
        'is_new'         => 'boolean',
    ];

    protected $appends = ['discount_rate'];

    public function getDiscountRateAttribute(): int
    {
        if (!$this->original_price || $this->original_price <= $this->price) return 0;
        return (int) round((1 - $this->price / $this->original_price) * 100);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
