# Push Myself - 자기계발 다이어리

목표 설정, 일기 작성, 통계 분석을 통해 자기계발을 도와주는 PWA(Progressive Web App)입니다.

## 🚀 주요 기능

- **대시보드**: 일일 명언, 자기 암시, 완료된 일들 한눈에 보기
- **TODO 관리**: 우선순위별 할 일 관리 및 드래그 앤 드롭으로 순서 변경
- **생각정리**: 하루의 생각과 아이디어를 정리하는 공간
- **일기 작성**: 하루를 돌아보고 기록하는 다이어리
- **통계 분석**: 완료한 일들의 통계와 추이 분석
- **PWA 지원**: 모바일 앱처럼 설치하여 사용 가능

## 📱 PWA 기능

이 앱은 PWA(Progressive Web App)로 제작되어 다음과 같은 기능을 제공합니다:

- **홈 화면 설치**: 모바일 기기의 홈 화면에 앱 아이콘으로 설치 가능
- **오프라인 지원**: 인터넷 연결 없이도 기본 기능 사용 가능
- **앱과 같은 경험**: 네이티브 앱과 유사한 사용자 경험
- **자동 업데이트**: 새로운 버전이 자동으로 업데이트됨

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **PWA**: next-pwa
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit

## 🚀 시작하기

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 빌드 및 배포

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
push_myself/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃 (PWA 메타데이터 포함)
│   ├── page.tsx           # 메인 페이지
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
│   ├── MainPage.tsx       # 메인 페이지 컴포넌트
│   ├── PWAInstall.tsx     # PWA 설치 프롬프트
│   └── tabs/              # 탭별 컴포넌트들
├── data/                  # 데이터 관리
│   ├── types.ts           # TypeScript 타입 정의
│   ├── utils.ts           # 유틸리티 함수
│   └── ...
├── public/                # 정적 파일
│   ├── manifest.json      # PWA 매니페스트
│   ├── sw.js             # 서비스 워커
│   ├── icon.svg          # 앱 아이콘
│   └── ...
└── ...
```

## 🔧 PWA 설정

### 매니페스트 파일
`public/manifest.json`에서 앱의 메타데이터를 설정할 수 있습니다:
- 앱 이름 및 설명
- 아이콘 설정
- 테마 색상
- 디스플레이 모드

### 서비스 워커
`public/sw.js`에서 오프라인 캐싱 및 백그라운드 동기화를 관리합니다.

### 메타데이터
`app/layout.tsx`에서 SEO 및 PWA 관련 메타데이터를 설정합니다.

## 📊 데이터 저장

모든 데이터는 브라우저의 로컬 스토리지에 저장되며, 다음 정보들이 포함됩니다:
- 일일 TODO 목록
- 완료된 일들
- 일기 내용
- 생각 정리
- 자기 암시

## 🎨 커스터마이징

### 색상 테마 변경
`app/layout.tsx`의 `themeColor` 속성을 수정하여 앱의 테마 색상을 변경할 수 있습니다.

### 아이콘 변경
`public/` 폴더의 아이콘 파일들을 교체하여 앱 아이콘을 변경할 수 있습니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

버그 리포트, 기능 제안, 풀 리퀘스트를 환영합니다!

---

**Push Myself** - 하루가 모여 인생이 바뀐다. 🔥
