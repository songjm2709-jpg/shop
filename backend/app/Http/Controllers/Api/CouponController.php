<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;

class CouponController extends Controller
{
    public function index()
    {
        $coupons = Coupon::with('category')
            ->where('is_active', true)
            ->where('end_date', '>=', now())
            ->orderBy('end_date')
            ->get()
            ->map(fn($c) => [
                'id'         => $c->id,
                'type'       => $c->type,
                'amount'     => $c->amount,
                'name'       => $c->name,
                'start_date' => $c->start_date->format('Y. n. j.'),
                'end_date'   => $c->end_date->format('Y. n. j. A g:i:s'),
                'd_day'      => $c->d_day,
                'category'   => $c->category ? ['id' => $c->category->id, 'name' => $c->category->name] : null,
            ]);

        return response()->json($coupons);
    }
}
