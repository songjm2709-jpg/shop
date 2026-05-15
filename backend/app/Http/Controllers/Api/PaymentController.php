<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function confirm(Request $request)
    {
        $request->validate([
            'payment_key' => 'required|string',
            'order_id' => 'required|integer',
            'amount' => 'required|integer',
        ]);

        $order = Order::where('id', $request->order_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($order->total_amount !== $request->amount) {
            return response()->json(['message' => '결제 금액이 일치하지 않습니다.'], 422);
        }

        // 토스페이먼츠 결제 승인 API 호출
        $response = Http::withBasicAuth(config('services.toss.secret_key'), '')
            ->post('https://api.tosspayments.com/v1/payments/confirm', [
                'paymentKey' => $request->payment_key,
                'orderId' => str_pad((string) $order->id, 6, '0', STR_PAD_LEFT),
                'amount' => $request->amount,
            ]);

        if ($response->failed()) {
            $error = $response->json();

            return response()->json([
                'message' => $error['message'] ?? '결제 승인에 실패했습니다.',
                'code' => $error['code'] ?? 'UNKNOWN',
            ], 422);
        }

        $tossData = $response->json();

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'payment_key' => $tossData['paymentKey'],
                'method' => $tossData['method'],
                'status' => 'done',
                'amount' => $tossData['totalAmount'],
            ]
        );

        $order->update(['status' => Order::STATUS_PAID]);

        return response()->json([
            'order' => $order->load(['items.product', 'payment']),
        ]);
    }
}
