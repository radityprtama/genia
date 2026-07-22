import { appUrl } from "../../lib/app-url"
"use client";
import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import React from "react";
import { useTheme } from "next-themes";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@workspace/ui/components/navigation-menu";
import { useMedia } from "../../hooks/use-media";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { cn } from "../../lib/utils";
import { ThemeSwitcher } from "../kibo-ui/theme-switcher";
import {
  Sparkle,
  Shield,
  Robot,
  RocketLaunch,
  Cloud,
  Diamond,
  DeviceMobile,
  ShoppingBag,
  Cpu,
  Lifebuoy,
  Notebook,
  Pulse,
  List,
  X,
} from "@phosphor-icons/react";

interface FeatureLink {
  href: string;
  name: string;
  description?: string;
  icon: React.ReactElement;
}

interface MobileLink {
  groupName?: string;
  links?: FeatureLink[];
  name?: string;
  href?: string;
}

const features: FeatureLink[] = [
  {
    href: "#ux",
    name: "AI",
    description: "Generate Insights and Recommendations",
    icon: <Sparkle weight="duotone" className="text-foreground" />,
  },
  {
    href: "#performance",
    name: "Performance",
    description: "Lightning-fast load times",
    icon: <Pulse weight="duotone" className="text-foreground" />,
  },
  {
    href: "#security",
    name: "Security",
    description: "Keep your data safe and secure",
    icon: <Shield weight="duotone" className="text-foreground" />,
  },
];

const moreFeatures: FeatureLink[] = [
  {
    href: "#ux",
    name: "Automation",
    description: "Automate your workflow",
    icon: <Robot weight="duotone" className="text-foreground" />,
  },
  {
    href: "#performance",
    name: "Scalability",
    description: "Scale your application",
    icon: <RocketLaunch weight="duotone" className="text-foreground" />,
  },
  {
    href: "#security",
    name: "Backup",
    description: "Keep your data backed up",
    icon: <Cloud weight="duotone" className="text-foreground" />,
  },
  {
    href: "#security",
    name: "Security",
    description: "Keep your data safe and secure",
    icon: <Shield weight="duotone" className="text-foreground" />,
  },
  {
    href: "#support",
    name: "Partnerships",
    description: "Get help when you need it",
    icon: <Diamond weight="duotone" className="text-foreground" />,
  },
  {
    href: "#mobile",
    name: "Mobile App",
    description: "Get help when you need it",
    icon: <DeviceMobile weight="duotone" className="text-foreground" />,
  },
];

const useCases: FeatureLink[] = [
  {
    href: "#ux",
    name: "Marketplace",
    description: "Find and buy AI tools",
    icon: <ShoppingBag weight="duotone" className="text-foreground" />,
  },
  {
    href: "#security",
    name: "API Integration",
    description: "Integrate AI tools into your app",
    icon: <Cpu weight="duotone" className="text-foreground" />,
  },
  {
    href: "#support",
    name: "Partnerships",
    description: "Get help when you need it",
    icon: <Diamond weight="duotone" className="text-foreground" />,
  },
  {
    href: "#mobile",
    name: "Mobile App",
    description: "Get help when you need it",
    icon: <DeviceMobile weight="duotone" className="text-foreground" />,
  },
];

const contentLinks: FeatureLink[] = [
  {
    name: "Help Center",
    href: "/help",
    description: "Answers to your questions",
    icon: <Lifebuoy weight="duotone" className="text-foreground" />,
  },
  {
    name: "Blog",
    href: "/blog",
    description: "Insights and stories",
    icon: <Notebook weight="duotone" className="text-foreground" />,
  },
];

const mobileLinks: MobileLink[] = [
  {
    groupName: "Product",
    links: features,
  },
  {
    groupName: "Solutions",
    links: useCases,
  },
  {
    groupName: "Resources",
    links: contentLinks,
  },
  { name: "Pricing", href: "/pricing" },
  { name: "Company", href: "/company" },
  { name: "Contact", href: "/contact" },
  { name: "About", href: "/about" },
  { name: "Open Startup", href: "/open" },
  { name: "Brand", href: "/brand" },
  { name: "Component Library", href: "/brand/components" },
  { name: "OSS Friends", href: "/oss-friends" },
  { name: "Affiliate", href: "/affiliate" },
];

// ✅ NEW: prevent hydration mismatch for theme-based logo
function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

function GeniaLogo({
  className,
  priority = true,
}: {
  className?: string;
  priority?: boolean;
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
      width={121}
      height={70}
      className={className}
    />
  );
}

export default function MarketingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const isLarge = useMedia("(min-width: 64rem)");
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      role="banner"
      data-state={isMobileMenuOpen ? "active" : "inactive"}
      {...(isScrolled && { "data-scrolled": true })}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "border-foreground/5 absolute inset-x-0 top-0 z-50 transition-all duration-500 ease-in-out",
          "in-data-scrolled:border-b in-data-scrolled:bg-background/80 in-data-scrolled:backdrop-blur-md",
          !isLarge && "h-14 overflow-hidden border-b",
          isMobileMenuOpen &&
            "bg-background/95 h-[100dvh] overflow-hidden backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        )}
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="relative flex flex-wrap items-center justify-between lg:py-5">
            <div className="max-lg:border-foreground/5 flex justify-between gap-8 max-lg:h-14 max-lg:w-full max-lg:border-b">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <span className="h-5 flex items-center text-foreground font-semibold">
                  {/* ✅ CHANGED: light/dark logo */}
                  <GeniaLogo />
                </span>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden"
              >
                {/* ✅ CHANGED: Menu icon */}
                <List
                  size={24}
                  weight="regular"
                  className="in-data-[state=active]:rotate-90 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto transition-all duration-300 ease-out"
                />
                {/* ✅ CHANGED: Close icon */}
                <X
                  size={24}
                  weight="regular"
                  className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto -rotate-90 scale-0 opacity-0 transition-all duration-300 ease-out"
                />
              </button>
            </div>

            {isLarge && (
              <div className="absolute inset-0 m-auto size-fit">
                <NavMenu />
              </div>
            )}
            {!isLarge && isMobileMenuOpen && (
              <MobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
            )}

            <div className="max-lg:in-data-[state=active]:mt-6 in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <ThemeSwitcher
                  defaultValue="system"
                  onChange={setTheme}
                  value={theme as "light" | "dark" | "system"}
                />
                <Button asChild size="sm">
                  <a href={appUrl("/login?mode=sign-up")}>
                    <span>Sign Up</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const MobileMenu = ({ closeMenu }: { closeMenu: () => void }) => {
  return (
    <nav
      role="navigation"
      className="flex h-[calc(100dvh-3.5rem)] w-full flex-col overflow-y-auto pt-4 pb-[env(safe-area-inset-bottom)] [--color-muted:--alpha(var(--color-foreground)/5%)] animate-in slide-in-from-top-4 fade-in duration-500 ease-out"
    >
      <div className="flex-1 px-6">
        <Accordion type="single" collapsible className="w-full space-y-1">
          {mobileLinks.map((link, index) => {
            if (link.groupName && link.links) {
              return (
                <AccordionItem
                  key={index}
                  value={link.groupName}
                  className="border-b-0"
                >
                  <AccordionTrigger className="flex w-full items-center justify-between py-5 text-left text-xl font-medium transition-all hover:no-underline [&[data-state=open]>svg]:rotate-180 [&[data-state=open]]:text-primary">
                    {link.groupName}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ul className="grid gap-3 pl-2">
                      {link.links.map((feature, featureIndex) => (
                        <li key={featureIndex}>
                          <Link
                            href={feature.href}
                            onClick={closeMenu}
                            className="flex w-full items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:bg-muted/50 active:bg-muted"
                          >
                            <div
                              aria-hidden
                              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground"
                            >
                              {feature.icon}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-base font-medium leading-none">
                                {feature.name}
                              </span>
                              {feature.description && (
                                <span className="text-muted-foreground line-clamp-1 text-xs">
                                  {feature.description}
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            }
            return null;
          })}
        </Accordion>

        <div className="flex flex-col space-y-1 py-2">
          {mobileLinks.map((link, index) => {
            if (link.name && link.href) {
              return (
                <Link
                  key={index}
                  href={link.href}
                  onClick={closeMenu}
                  className="block w-full py-5 text-xl font-medium transition-colors hover:text-primary active:text-primary border-b border-border/40 last:border-0"
                >
                  {link.name}
                </Link>
              );
            }
            return null;
          })}
        </div>
      </div>

      <div className="mt-auto border-t bg-background/50 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
        <Button
          asChild
          size="lg"
          className="h-14 w-full rounded-xl text-base shadow-lg shadow-primary/20"
        >
          <a href={appUrl("/login?mode=sign-up")} onClick={closeMenu}>
            Sign Up
          </a>
        </Button>
      </div>
    </nav>
  );
};

const NavMenu = () => {
  return (
    <NavigationMenu className="**:data-[slot=navigation-menu-viewport]:bg-[color-mix(in_oklch,var(--color-muted)_25%,var(--color-background))] **:data-[slot=navigation-menu-viewport]:shadow-lg **:data-[slot=navigation-menu-viewport]:rounded-2xl **:data-[slot=navigation-menu-viewport]:top-4 [--color-muted:color-mix(in_oklch,var(--color-foreground)_5%,transparent)] [--viewport-outer-px:2rem] max-lg:hidden">
      <NavigationMenuList className="gap-3">
        <NavigationMenuItem value="product">
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent className="origin-top pb-1.5 pl-1 pr-4 pt-1 backdrop-blur">
            <div className="min-w-6xl pr-18.5 grid w-full grid-cols-4 gap-1">
              <div className="bg-card row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                <span className="text-muted-foreground ml-2 text-xs">
                  Features
                </span>
                <ul>
                  {features.map((feature, index) => (
                    <ListItem
                      key={index}
                      href={feature.href}
                      title={feature.name}
                      description={feature.description}
                    >
                      {feature.icon}
                    </ListItem>
                  ))}
                </ul>
              </div>

              <div className="bg-card col-span-2 row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                <span className="text-muted-foreground ml-2 text-xs">
                  More Features
                </span>
                <ul className="grid grid-cols-2">
                  {moreFeatures.map((feature, index) => (
                    <ListItem
                      key={index}
                      href={feature.href}
                      title={feature.name}
                      description={feature.description}
                    >
                      {feature.icon}
                    </ListItem>
                  ))}
                </ul>
              </div>

              <div className="row-span-2 grid grid-rows-subgrid">
                <div className="bg-linear-to-b inset-ring-foreground/10 inset-ring-1 relative row-span-2 grid overflow-hidden rounded-xl bg-emerald-100 from-white via-white/50 to-sky-100 p-1 transition-colors duration-200 hover:bg-emerald-50">
                  <div className="aspect-3/2 absolute inset-0 px-6 pt-2">
                    <div className="mask-b-from-35% before:bg-background before:ring-foreground/10 after:ring-foreground/5 after:bg-background/75 before:z-1 group relative -mx-4 h-4/5 px-4 pt-6 before:absolute before:inset-x-6 before:bottom-0 before:top-4 before:rounded-t-xl before:border before:border-transparent before:ring-1 after:absolute after:inset-x-9 after:bottom-0 after:top-2 after:rounded-t-xl after:border after:border-transparent after:ring-1">
                      <div className="bg-card ring-foreground/10 relative z-10 h-full overflow-hidden rounded-t-xl border border-transparent p-8 text-sm shadow-xl shadow-black/25 ring-1"></div>
                    </div>
                  </div>
                  <div className="space-y-0.5 self-end p-3">
                    <NavigationMenuLink
                      asChild
                      className="text-foreground p-0 text-sm font-medium before:absolute before:inset-0 hover:bg-transparent focus:bg-transparent"
                    >
                      <Link href="#">Multimodal Learning</Link>
                    </NavigationMenuLink>
                    <p className="text-foreground/60 line-clamp-1 text-xs">
                      Explore how our platform integrates text, image, and audio
                      processing into a unified framework.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem value="solutions">
          <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
          <NavigationMenuContent className="origin-top pb-1.5 pl-1 pr-4 pt-1 backdrop-blur">
            <div className="min-w-6xl pr-18.5 grid w-full grid-cols-4 gap-1">
              <div className="bg-card col-span-2 row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                <span className="text-muted-foreground ml-2 text-xs">
                  Use Cases
                </span>
                <ul className="grid grid-cols-2">
                  {useCases.map((useCase, index) => (
                    <ListItem
                      key={index}
                      href={useCase.href}
                      title={useCase.name}
                      description={useCase.description}
                    >
                      {useCase.icon}
                    </ListItem>
                  ))}
                </ul>
              </div>

              <div className="bg-card row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                <span className="text-muted-foreground ml-2 text-xs">Apps</span>
                <ul>
                  {features
                    .slice(0, features.length - 1)
                    .map((feature, index) => (
                      <ListItem
                        key={index}
                        href={feature.href}
                        title={feature.name}
                        description={feature.description}
                      >
                        {feature.icon}
                      </ListItem>
                    ))}
                </ul>
              </div>

              <div className="row-span-2 grid grid-rows-subgrid gap-1 p-1 pt-3">
                <span className="text-muted-foreground ml-2 text-xs">
                  Content
                </span>
                <ul>
                  {contentLinks.map((content, index) => (
                    <NavigationMenuLink key={index} asChild>
                      <Link
                        href={content.href}
                        className="grid grid-cols-[auto_1fr] items-center gap-2.5"
                      >
                        {content.icon}
                        <div className="text-foreground text-sm font-medium">
                          {content.name}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </ul>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent className="origin-top pb-1.5 pl-1 pr-4 pt-1 backdrop-blur">
            <div className="min-w-6xl grid w-full grid-cols-3 gap-1">
              <div className="bg-card row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                <span className="text-muted-foreground ml-2 text-xs">
                  Support
                </span>
                <ul>
                  <ListItem
                    href={contentLinks[0].href}
                    title={contentLinks[0].name}
                    description={contentLinks[0].description}
                  >
                    {contentLinks[0].icon}
                  </ListItem>
                </ul>
              </div>
              <div className="bg-card row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                <span className="text-muted-foreground ml-2 text-xs">
                  Learn
                </span>
                <ul>
                  <ListItem
                    href={contentLinks[1].href}
                    title={contentLinks[1].name}
                    description={contentLinks[1].description}
                  >
                    {contentLinks[1].icon}
                  </ListItem>
                </ul>
              </div>
              <div className="row-span-2 grid grid-rows-subgrid gap-1 p-1 pt-3">
                <span className="text-muted-foreground ml-2 text-xs">
                  Explore
                </span>
                <ul>
                  {contentLinks.map((content, index) => (
                    <NavigationMenuLink key={index} asChild>
                      <Link
                        href={content.href}
                        className="grid grid-cols-[auto_1fr] items-center gap-2.5"
                      >
                        {content.icon}
                        <div className="text-foreground text-sm font-medium">
                          {content.name}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </ul>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem value="pricing">
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/pricing">Pricing</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem value="company">
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/company">Company</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

function ListItem({
  title,
  description,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  title: string;
  description?: string;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild className="rounded-lg">
        <Link href={href} className="grid grid-cols-[auto_1fr] gap-3.5">
          <div className="bg-card ring-foreground/10 relative flex size-10 items-center justify-center rounded border border-transparent shadow shadow-sm ring-1">
            {children}
          </div>
          <div className="space-y-0.5">
            <div className="text-foreground text-sm font-medium">{title}</div>
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {description}
            </p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
