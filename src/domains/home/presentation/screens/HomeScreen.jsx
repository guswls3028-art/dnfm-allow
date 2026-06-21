"use client";

import Link from "next/link";
import PageShell from "@/domains/site_shell/presentation/components/PageShell";
import HeroSlider from "@/domains/home/presentation/components/HeroSlider";
import HostBanner from "@/domains/home/presentation/components/HostBanner";
import QuickNotice from "@/domains/home/presentation/components/QuickNotice";
import CommunityBoard from "@/domains/home/presentation/components/CommunityBoard";
import EventCarousel from "@/domains/events/presentation/components/EventCarousel";

/**
 * 홈 — 던파 공홈 레이어 차용 (B급 디자인 토큰 유지).
 *
 *   ┌─ Hero Slider — wide / wide-text 슬라이드 회전 배너 (5:1 규격)
 *   ├─ Host Banner — 허락 portrait + 3채널 (SOOP/치지직/유튜브) 아이콘 항상 노출
 *   ├─ Quick Notice — 공지/업데이트 2줄 + 더 보기 ⌄
 *   ├─ Community+ — 4탭 게시판 (제목 클릭 = 전체보기)
 *   ├─ Event Carousel — 이벤트 카드 슬라이딩 (제목 클릭 = 전체보기)
 *   ├─ 부가 진입 (지난 회차 기록 / 방송 게임 포탈)
 *   └─ 뉴비 훈련소 compact pill — 최하단 작은 링크
 */
export default function HomeScreen() {
  return (
    <PageShell activePath="/">
      <HeroSlider />
      <HostBanner />
      <QuickNotice />
      <CommunityBoard />
      <EventCarousel />

      <section className="section home-extra-links" aria-label="부가 진입">
        <Link href="/events/history" className="btn btn-sm">
          🗂️ 지난 회차 기록
        </Link>
        <Link href="/play" className="btn btn-sm">
          🎰 방송 게임 포탈
        </Link>
      </section>

      <div className="home-newb-pill-wrap">
        <a
          className="home-newb-pill"
          href="https://dnfm.kr"
          target="_blank"
          rel="noreferrer"
          title="던파 모바일 입문 가이드"
        >
          <span aria-hidden="true">↗</span>
          뉴비 훈련소 · dnfm.kr
        </a>
      </div>
    </PageShell>
  );
}
