<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => '전자기기'],
            ['name' => '의류'],
            ['name' => '식품'],
            ['name' => '생활용품'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        $products = [
            ['category_id' => 1, 'name' => '무선 이어폰', 'description' => '고품질 무선 블루투스 이어폰', 'price' => 59000, 'stock' => 50, 'image' => null],
            ['category_id' => 1, 'name' => '스마트워치', 'description' => '건강 관리 스마트워치', 'price' => 199000, 'stock' => 30, 'image' => null],
            ['category_id' => 1, 'name' => '노트북 거치대', 'description' => '알루미늄 노트북 거치대', 'price' => 39000, 'stock' => 100, 'image' => null],
            ['category_id' => 2, 'name' => '기본 티셔츠', 'description' => '편안한 코튼 티셔츠', 'price' => 19000, 'stock' => 200, 'image' => null],
            ['category_id' => 2, 'name' => '청바지', 'description' => '슬림핏 데님 청바지', 'price' => 49000, 'stock' => 80, 'image' => null],
            ['category_id' => 3, 'name' => '유기농 커피', 'description' => '에티오피아 유기농 원두 200g', 'price' => 18000, 'stock' => 150, 'image' => null],
            ['category_id' => 4, 'name' => '텀블러', 'description' => '스테인리스 보온 텀블러 500ml', 'price' => 25000, 'stock' => 70, 'image' => null],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        User::create([
            'name' => '테스트 유저',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'phone' => '010-1234-5678',
            'address' => '서울시 강남구 테헤란로 123',
        ]);
    }
}
