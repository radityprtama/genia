"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import Ai03 from "@/components/marketing/sections/ai-03";
import { Suggestion } from "@/components/suggestion";
import { TypingAnimation } from "@/components/ai-elements/typing-animation";

type ProductIllustrationProps = {
  isAuthenticated?: boolean;
};

export const ProductIllustration = ({
  isAuthenticated = false,
}: ProductIllustrationProps) => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestions = [
    {
      label: "Restaurant website",
      prompt:
        "Create a modern website for my Italian restaurant with online menu, reservation system, and photo gallery of dishes",
    },
    {
      label: "Upgrade my site",
      prompt:
        "Redesign and upgrade my existing plumbing business website to be more modern, mobile-friendly, and include a booking form",
    },
    {
      label: "Portfolio site",
      prompt:
        "Build a professional portfolio website for my photography business with image galleries, client testimonials, and contact form",
    },
    {
      label: "Landing page",
      prompt:
        "Create a high-converting landing page for my SaaS startup with features, pricing tiers, and demo request form",
    },
    {
      label: "E-commerce store",
      prompt:
        "Make an online store for my boutique clothing business with product catalog, shopping cart, and payment integration",
    },
    {
      label: "Service business",
      prompt:
        "Build a website for my cleaning service business with service descriptions, pricing packages, and online booking system",
    },
    {
      label: "Professional site",
      prompt:
        "Create a modern website for my law firm with practice areas, attorney profiles, case studies, and consultation booking",
    },
  ];

  const handleSubmit = useCallback(
    (event?: FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      const trimmedPrompt = value.trim();
      if (!trimmedPrompt || isSubmitting) {
        return;
      }

      const search = new URLSearchParams({ prompt: trimmedPrompt }).toString();
      const destination = isAuthenticated ? "/dashboard" : "/auth?mode=sign-up";

      setIsSubmitting(true);
      router.push(`${destination}?${search}`);
    },
    [isAuthenticated, isSubmitting, router, value],
  );

  return (
    <div className="mx-auto w-full max-w-xl px-4">
      <Ai03
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        controlsEnabled={isAuthenticated}
      >
        {!value && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-24px)] truncate text-xs text-muted-foreground no-underline md:left-4 md:top-4 md:text-sm">
            <span className="no-underline">Ask Genia to make </span>
            <TypingAnimation
              words={[
                "a new modern website for www.Genia.tech...",
                "an upgraded website for my plumbing business...",
                "a portfolio site for my photography studio...",
                "a landing page for my SaaS startup...",
                "an e-commerce store for my boutique...",
              ]}
              loop={true}
              typeSpeed={50}
              deleteSpeed={30}
              pauseDelay={800}
              className="inline leading-normal tracking-normal no-underline decoration-none"
              showCursor={false}
            />
          </div>
        )}
      </Ai03>
      <div className="mt-4 flex flex-wrap justify-center gap-3 md:mt-6 md:gap-4">
        {suggestions.map((suggestion, index) => (
          <Suggestion
            key={index}
            onClick={() => {
              if (isSubmitting) {
                return;
              }
              setValue(suggestion.prompt);
            }}
            suggestion={suggestion.label}
          />
        ))}
      </div>
    </div>
  );
};
