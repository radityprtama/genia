"use client";
import React from "react";
import { Link } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { cn } from "../../lib/utils";

const links = [
  {
    group: "Product",
    items: [
      { title: "Overview", href: "/" },
      { title: "Pricing", href: "/pricing" },
      { title: "Integrations", href: "/integrations" },
      { title: "Affiliate", href: "/affiliate" },
      { title: "Customers", href: "/customers" },
    ],
  },
  {
    group: "Resources",
    items: [
      { title: "Blog", href: "/blog" },
      { title: "Help Center", href: "/help" },
      { title: "Getting Started", href: "/help/category/getting-started" },
      { title: "Playbooks", href: "/help/category/for-investors" },
      { title: "Brand Assets", href: "/brand" },
    ],
  },
  {
    group: "Company",
    items: [
      { title: "About", href: "/about" },
      { title: "Contact", href: "/contact" },
      { title: "Open Startup", href: "/open" },
      { title: "Sign In", href: "/auth?mode=sign-in" },
    ],
  },
];

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

function GeniaFooterLogo({
  className,
}: {
  className?: string;
}) {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  const lightLogo =
    "https://pub-07f684470f2a43e6a8d941be05aaadcc.r2.dev/genialight.png";
  const darkLogo =
    "https://pub-07f684470f2a43e6a8d941be05aaadcc.r2.dev/geniadark.png";

  const src = !mounted
    ? darkLogo
    : resolvedTheme === "dark"
      ? lightLogo
      : darkLogo;

  return (
    <img
      src={src}
      alt="Genia"
      width={300}
      height={150}
      className={cn("w-48 md:w-64 h-auto object-contain", className)}
    />
  );
}

export default function FooterSection() {
  return (
    <footer className="bg-muted border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        {/* Main Grid - Menggunakan layout 12 kolom untuk fleksibilitas lebih */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Section - Diperlebar (col-span-5) untuk menampung logo besar */}
          <div className="lg:col-span-5 flex flex-col items-start gap-6">
            <Link
              href="/"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <GeniaFooterLogo />
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm pl-8">
              Helps agencies build AI-powered websites faster with collaborative
              workflows.
            </p>
          </div>

          {/* Links Section - (col-span-7) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {links.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                  {section.group}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <p>© {new Date().getFullYear()} Genia. All rights reserved.</p>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://twitter.com/geniatech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-foreground transition-colors"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z" />
              </svg>
            </Link>
            <Link
              href="https://www.linkedin.com/company/genia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-foreground transition-colors"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
              </svg>
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border/50 shadow-sm">
              <div className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse"></span>
                <span className="relative m-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-xs font-medium">All Systems Normal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
