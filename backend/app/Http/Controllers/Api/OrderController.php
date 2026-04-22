<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with(['items.product', 'payment'])
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403, '접근 권한이 없습니다.');
        }

        return response()->json($order->load(['items.product', 'payment']));
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_name' => 'required|string|max:100',
            'receiver_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
        ]);

        $cart = $request->user()->cart()->with('items.product')->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json(['message' => '장바구니가 비어있습니다.'], 422);
        }

        foreach ($cart->items as $item) {
            if ($item->product->stock < $item->quantity) {
                return response()->json([
                    'message' => "{$item->product->name}의 재고가 부족합니다.",
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($request, $cart) {
            $totalAmount = $cart->items->sum(
                fn ($item) => $item->product->price * $item->quantity
            );

            $order = Order::create([
                'user_id' => $request->user()->id,
                'total_amount' => $totalAmount,
                'status' => Order::STATUS_PENDING,
                'receiver_name' => $request->receiver_name,
                'receiver_phone' => $request->receiver_phone,
                'shipping_address' => $request->shipping_address,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            $cart->items()->delete();

            return $order;
        });

        return response()->json($order->load(['items.product', 'payment']), 201);
    }
}
