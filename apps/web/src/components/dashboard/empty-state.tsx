import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Globe, Sparkle } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

export function EmptyDashboardState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Globe className="h-6 w-6" weight="duotone" />
        </EmptyMedia>
        <EmptyTitle>No websites yet</EmptyTitle>
        <EmptyDescription>
          Start building your first website with our AI-powered builder. Answer
          a few questions and watch your site come to life.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link href="/builder">
              <Sparkle className="h-5 w-5 mr-2" weight="duotone" />
              Create Your First Website
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/projects">View All Projects</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
