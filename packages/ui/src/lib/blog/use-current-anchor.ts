import { useEffect, useState } from "react";

export default function useCurrentAnchor() {
  const [currentAnchor, setCurrentAnchor] = useState<string | null>(null);

  useEffect(() => {
    const mdxContainer = document.querySelector("[data-mdx-container]");
    if (!mdxContainer) return;

    const headings = Array.from(mdxContainer.querySelectorAll("h2"));
    if (headings.length === 0) return;

    const getActiveHeading = () => {
      const scrollY = window.scrollY;
      const headerOffset = 100;

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const headingTop = heading.getBoundingClientRect().top + scrollY;

        if (scrollY >= headingTop - headerOffset) {
          return heading.id;
        }
      }

      return headings[0].id;
    };

    const onScroll = () => {
      const activeHeading = getActiveHeading();
      setCurrentAnchor(activeHeading);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return currentAnchor;
}
