"use client";

import { SectionBook } from "./section-book";
import { SectionDemo } from "./section-demo";
import { SectionNext } from "./section-next";
import { SectionProblem } from "./section-problem";
import { SectionSolution } from "./section-solution";
import { SectionStart } from "./section-start";
import { SectionPricing } from "./section-pricing";
import { SectionTeam } from "./section-team";
import { SectionTraction } from "./section-traction";
import { SectionVision } from "./section-vision";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";
import { useEffect, useState } from "react";
import { CarouselToolbar } from "./carousel-toolbar";

export function InvestorCarousel() {
  const [views, setViews] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    // Simulated view count - in production, this would fetch from a database
    setViews(150);
  }, []);

  return (
    <Carousel className="w-full min-h-full relative" setApi={setApi}>
      <CarouselContent>
        <CarouselItem>
          <SectionStart />
        </CarouselItem>
        <CarouselItem>
          <SectionProblem />
        </CarouselItem>
        <CarouselItem>
          <SectionSolution />
        </CarouselItem>
        <CarouselItem>
          <SectionDemo />
        </CarouselItem>
        <CarouselItem>
          <SectionTraction />
        </CarouselItem>
        <CarouselItem>
          <SectionTeam />
        </CarouselItem>
        <CarouselItem>
          <SectionPricing />
        </CarouselItem>
        <CarouselItem>
          <SectionVision />
        </CarouselItem>
        <CarouselItem>
          <SectionNext />
        </CarouselItem>
        <CarouselItem>
          <SectionBook />
        </CarouselItem>
      </CarouselContent>

      {api && <CarouselToolbar api={api} views={views} />}
    </Carousel>
  );
}
