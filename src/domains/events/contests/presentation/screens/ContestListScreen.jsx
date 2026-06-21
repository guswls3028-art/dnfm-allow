"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/domains/site_shell/presentation/components/PageShell";
import ContestCard from "@/domains/events/contests/presentation/components/ContestCard";
import StickerBadge from "@/shared/ui/StickerBadge";
import { contests as contestsApi } from "@/shared/api/api-client";
import { hero } from "@/domains/site_content/domain/content";

const TAB_DEFS = [
  { id: "open", label: "참가중", matches: (s) => s === "open" },
  { id: "voting", label: "심사/투표", matches: (s) => s === "closed" || s === "voting" || s === "judging" },
  {
    id: "completed",
    label: "결과 발표",
    matches: (s) => s === "results" || s === "archived",
  },
];

export default function ContestListScreen() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await contestsApi.list();
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.items || data?.contests || [];
        setContests(list);
      } catch {
        if (alive) setContests([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const grouped = TAB_DEFS.map((t) => ({
    ...t,
    items: contests.filter((c) => t.matches(c.status)),
  }));
  const hasContests = contests.length > 0;
  const mainLiveAction = hero.primaryActions?.[0];

  return (
    <PageShell activePath="/contests">
      <div className="page-head">
        <div>
          <h1>
            허락 콘테스트 <StickerBadge tone="pink" rotate="r">참가/투표</StickerBadge>
          </h1>
          <p>
            진행 중인 콘테스트, 투표, 결과 발표를 한곳에서 확인합니다.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="callout-box is-pending">
          <strong>콘테스트 확인 중</strong>
          지금 열려 있는 참가/투표/결과를 불러오고 있습니다.
        </div>
      ) : !hasContests ? (
        <section className="contest-empty-hero" aria-labelledby="contest-empty-title">
          <div className="contest-empty-copy">
            <StickerBadge tone="cyan" rotate="l">현재 휴식</StickerBadge>
            <h2 id="contest-empty-title">지금 열린 콘테스트는 없습니다</h2>
            <p>
              오늘 할 일을 찾는 시청자는 방송 채널, 지난 이벤트 기록, 추첨 기록으로 바로 이동할 수 있습니다.
            </p>
          </div>
          <div className="contest-empty-actions">
            {mainLiveAction?.url ? (
              <a className="btn btn-primary" href={mainLiveAction.url} target="_blank" rel="noreferrer">
                방송 보기
              </a>
            ) : null}
            <Link className="btn btn-cyan" href="/events/history">
              지난 이벤트
            </Link>
            <Link className="btn btn-ghost" href="/play">
              추첨 기록
            </Link>
          </div>
        </section>
      ) : (
        grouped.map((tab) => (
          <section key={tab.id} className="section" aria-labelledby={`tab-${tab.id}`}>
            <div className="section-head">
              <h2 id={`tab-${tab.id}`}>
                {tab.label} <span className="section-count">({tab.items.length})</span>
              </h2>
            </div>
            {tab.items.length === 0 ? (
              <div className="callout-box contest-stage-empty">
                <strong>{tab.label}</strong>
                현재 이 단계는 비어 있습니다.
              </div>
            ) : (
              <div className="grid grid-3">
                {tab.items.map((c, i) => (
                  <ContestCard key={c.id} contest={c} tilt={i % 2 === 0 ? "l" : "r"} />
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </PageShell>
  );
}
