import SiteHeader from "@/domains/site_shell/presentation/components/SiteHeader";
import SiteFooter from "@/domains/site_shell/presentation/components/SiteFooter";

/**
 * PageShell — 공통 shell.
 *  - sticky header (activePath nav)
 *  - main (flex 1)
 *  - footer
 */
export default function PageShell({ children, activePath = "/" }) {
  return (
    <div className="hurock-shell">
      <SiteHeader activePath={activePath} />
      <main className="hurock-main" id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
