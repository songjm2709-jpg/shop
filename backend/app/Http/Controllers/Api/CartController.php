<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getOrCreateCart(Request $request): Cart
    {
        return Cart::firstOrCreate(['user_id' => $request->user()->id]);
    }

    public function index(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->load('items.product.category');

        return response()->json([
            'id' => $cart->id,
            'items' => $cart->items,
            'total' => $cart->total,
        ]);
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return response()->json(['message' => '재고가 부족합니다.'], 422);
        }

        $cart = $this->getOrCreateCart($request);

        $item = $cart->items()->where('product_id', $request->product_id)->first();

        if ($item) {
            $newQty = $item->quantity + $request->quantity;
            if ($product->stock < $newQty) {
                return response()->json(['message' => '재고가 부족합니다.'], 422);
            }
            $item->update(['quantity' => $newQty]);
        } else {
            $item = $cart->items()->create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        $cart->load('items.product');

        return response()->json([
            'id' => $cart->id,
            'items' => $cart->items,
            'total' => $cart->total,
        ]);
    }

    public function updateItem(Request $request, CartItem $cartItem)
    {
        $this->authorizeCartItem($request, $cartItem);

        $request->validate(['quantity' => 'required|integer|min:1']);

        if ($cartItem->product->stock < $request->quantity) {
            return response()->json(['message' => '재고가 부족합니다.'], 422);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        $cart = $cartItem->cart->load('items.product');

        return response()->json([
            'id' => $cart->id,
            'items' => $cart->items,
            'total' => $cart->total,
        ]);
    }

    public function removeItem(Request $request, CartItem $cartItem)
    {
        $this->authorizeCartItem($request, $cartItem);

        $cart = $cartItem->cart;
        $cartItem->delete();

        $cart->load('items.product');

        return response()->json([
            'id' => $cart->id,
            'items' => $cart->items,
            'total' => $cart->total,
        ]);
    }

    public function clear(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();

        return response()->json(['message' => '장바구니가 비워졌습니다.']);
    }

    private function authorizeCartItem(Request $request, CartItem $cartItem): void
    {
        if ($cartItem->cart->user_id !== $request->user()->id) {
            abort(403, '접근 권한이 없습니다.');
        }
    }
}
