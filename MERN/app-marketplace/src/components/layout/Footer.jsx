import { Link } from 'wouter';
import { Twitter, Instagram, Github } from 'lucide-react';

function AppMark() {
  return (
    <div className="flex items-center gap-2.5" aria-label="Cutting Edge Apps home">
      <div className="relative flex size-8 items-center justify-center rounded-full border border-[#d8b985]/70">
        <span className="absolute size-2.5 rounded-full bg-[#ee9d83]" />
        <span className="absolute h-5 w-px rotate-45 bg-[#a9d0b8]" />
      </div>
      <span className="display text-[25px] leading-none tracking-[-.02em] text-neutral-100">Cutting Edge Apps</span>
    </div>
  );
}

const COLUMNS = [
  {
    heading: 'Marketplace',
    links: [
      { label: 'Browse apps', href: '/#catalog' },
      { label: 'Top selling', href: '/#top' },
      { label: 'My orders', href: '/orders' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Contact us', href: '/#contact' },
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="footer" className="site-footer">
      <div className="section-container py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.85fr_0.85fr_1fr]">
          <div>
            <AppMark />
            <p className="mt-4 max-w-xs text-[13px] leading-6 text-neutral-500">
              A premium marketplace for discovering, evaluating, and purchasing polished web apps for small business.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="flex size-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:border-[#a9d0b8] hover:text-[#a9d0b8]"><Twitter className="size-3.5" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:border-[#ee9d83] hover:text-[#ee9d83]"><Instagram className="size-3.5" /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="flex size-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-200"><Github className="size-3.5" /></a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <div className="footer-heading">{column.heading}</div>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="footer-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <div className="footer-heading">Get in touch</div>
            <ul className="mt-4 space-y-2.5">
              <li className="footer-link">hello@cuttingedgeapps.com</li>
              <li className="footer-link">+91 90000 00000</li>
              <li className="footer-link">Remote-first team</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-neutral-800/80 pt-6 text-[11px] text-neutral-500 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Cutting Edge Enterprises. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <span>Secure checkout via Razorpay</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#ee9d83] sm:block" />
            <span>Web apps for small business</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
