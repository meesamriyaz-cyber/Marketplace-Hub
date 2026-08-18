import { LockKeyhole } from 'lucide-react';

export default function MarketplaceFooter() {
  return <footer className="border-t border-border bg-background"><div className="section-container flex min-h-[52px] items-center justify-between gap-4 py-3 text-[11px] text-muted-foreground"><span>© 2026 Cutting-Edge Enterprises. All rights reserved.</span><span className="flex items-center gap-2"><LockKeyhole className="size-3.5 text-[#a9d0b8]" /><span>Secure payments</span></span></div></footer>;
}
