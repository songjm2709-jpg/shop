<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'type'        => '상품전용',
                'amount'      => 10000,
                'name'        => '올세라 탄탁크림 더블 추가 1만원 할인쿠폰',
                'start_date'  => '2026-05-12',
                'end_date'    => '2026-06-11 23:59:59',
                'category_id' => null,
                'is_active'   => true,
            ],
            [
                'type'        => '상품전용',
                'amount'      => 20000,
                'name'        => '[단하루]백광기미크림 더블 추가 2만원 할인쿠폰',
                'start_date'  => '2026-05-14',
                'end_date'    => '2026-06-13 23:59:59',
                'category_id' => null,
                'is_active'   => true,
            ],
            [
                'type'        => '상품전용',
                'amount'      => 15000,
                'name'        => '수분크림 세트 구매 시 추가 1만5천원 할인쿠폰',
                'start_date'  => '2026-05-10',
                'end_date'    => '2026-06-09 23:59:59',
                'category_id' => null,
                'is_active'   => true,
            ],
            [
                'type'        => '상품전용',
                'amount'      => 30000,
                'name'        => '프리미엄 스킨케어 세트 추가 3만원 할인쿠폰',
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-05-31 23:59:59',
                'category_id' => null,
                'is_active'   => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::create($coupon);
        }
    }
}
