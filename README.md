# dnfm-hurock

`hurock.dnfm.kr` — 허락(스트리머) 페이지 + 시청자 참여 이벤트 (콘테스트/투표/경품). `allow.dnfm.kr`은 레거시 호스트.

## 구조

- `src/app/` — Next.js App Router route shell. 실제 화면 구현은 `src/features/**/screens/`.
- `src/features/account/` — 내 활동/이벤트 화면
- `src/features/admin/` — 운영자 dashboard, reports, settings, live/draw 관리 화면
- `src/features/auth/` — 로그인/가입 화면
- `src/features/board/` — 게시판 화면, 작성/수정, 댓글/신고, board domain helper
- `src/features/events/contests/` — 콘테스트 목록/상세/참가/투표/결과/관리 UI
- `src/features/broadcast/` — 방송 질문/라이브 운영 UI
- `src/features/hero-banners/` — 홈 배너 운영 UI
- `src/features/home/` — 홈, 히어로, 빠른 공지, 커뮤니티 보드
- `src/features/play/` — 플레이/참여 페이지
- `src/features/profile/` — 프로필, 던파 인증, 시청 플랫폼 필드
- `src/features/site-content/` — 정적 콘텐츠 SSOT
- `src/features/site-shell/` — PageShell/header/footer/side menu
- `src/shared/api/` — API client, upload helpers
- `src/shared/auth/` — current user/session/admin role helpers
- `src/shared/ui/` — feature 소유권이 없는 재사용 UI
- 운영 문서 — 루트 `docs/hurock-*.md`

`dnfm.kr` 프론트엔드(`newb/`)와는 코드, CSS, 컴포넌트를 공유하지 않는다. 공유 계약은 `api.dnfm.kr`뿐이다.

## 실행

```bash
pnpm install
pnpm dev      # http://localhost:3001
pnpm build    # standalone output
pnpm start    # production preview (포트 3001)
```

## 배포

EC2 단일 인스턴스 + Cloudflare CDN. newb와 같은 EC2 인스턴스에 다른 포트(3001)·다른 디렉토리로 동거. 절차는 루트 `docs/hurock-deploy-ec2.md`.

## 운영 메모

- 핵심 운영자 = **허락님 본인**. 어드민 UI 만으로 콘테스트 생성·심사·투표·발표 가능해야 함 (방장 없이 돌아가야 함).
- 디자인 톤 = B급 감성. 정돈된 공식 톤 X.
- 외부 링크는 `src/features/site-content/content.js` 에서 `url: null` + `reason` 패턴으로 비활성 사유를 표시한다. 확정되면 URL만 채운다.
