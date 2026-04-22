# 설치 및 실행 가이드

## 사전 요구사항

- PHP 8.2+
- Composer
- MySQL 8.0+
- Node.js 20+
- npm

## 1. PHP / Composer 설치 (Mac)

```bash
brew install php composer
```

## 2. Node.js 설치 (Mac)

```bash
brew install node
```

## 3. 백엔드 설치

```bash
cd backend

# 의존성 설치
composer install

# 환경설정 파일 생성
cp .env.example .env
php artisan key:generate

# .env 파일에서 DB 정보 입력 후:
# DB_DATABASE=shop
# DB_USERNAME=root
# DB_PASSWORD=your_password

# 토스페이먼츠 키 입력:
# TOSS_CLIENT_KEY=test_ck_...
# TOSS_SECRET_KEY=test_sk_...

# DB 생성 및 마이그레이션
php artisan migrate --seed

# 서버 실행
php artisan serve
# → http://localhost:8000
```

## 4. 프론트엔드 설치

```bash
cd frontend

# 의존성 설치
npm install

# 환경설정 파일 생성
cp .env.example .env.local

# .env.local 에 입력:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...

# 개발 서버 실행
npm run dev
# → http://localhost:3000
```

## 5. 토스페이먼츠 키 발급

1. https://developers.tosspayments.com 접속
2. 회원가입 및 로그인
3. 내 개발정보 → 클라이언트 키 / 시크릿 키 복사

## 6. Vercel 자동 배포 설정

### GitHub Secrets 등록 (Repository → Settings → Secrets)

| 이름 | 값 |
|------|-----|
| `VERCEL_TOKEN` | Vercel 계정 토큰 (vercel.com → Settings → Tokens) |
| `VERCEL_ORG_ID` | `.vercel/project.json` 의 `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` 의 `projectId` |
| `NEXT_PUBLIC_API_URL` | 배포된 Laravel API URL |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스 클라이언트 키 |

### Vercel 프로젝트 연결

```bash
cd frontend
npm i -g vercel
vercel login
vercel link   # → .vercel/project.json 생성됨
```

### 이후 main 브랜치에 push하면 자동 배포됩니다.

## 7. 백엔드 배포 (Railway 추천)

1. https://railway.app 회원가입
2. New Project → Deploy from GitHub repo → backend 폴더 선택
3. MySQL 플러그인 추가
4. 환경변수 설정 (APP_KEY, DB_*, TOSS_*, FRONTEND_URL)
5. 제공된 URL을 `NEXT_PUBLIC_API_URL`에 등록

## 테스트 계정

- 이메일: test@example.com
- 비밀번호: password
