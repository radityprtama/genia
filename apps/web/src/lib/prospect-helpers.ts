import { ProspectReviewStatus } from "@prisma/client";
import type { ComponentType } from "react";
import {
  IconSend,
  IconClock,
  IconEye,
  IconFileText,
  IconRocket,
  IconLoader,
  IconExternalLink,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";

export type ProspectReview = {
  id: string;
  status: ProspectReviewStatus;
  prospectEmail: string;
  prospectName: string | null;
  shareToken: string;
  createdAt: Date | string;
  viewedAt: Date | string | null;
  approvedAt: Date | string | null;
  declinedAt: Date | string | null;
  expiresAt: Date | string | null;
  requestedDomain: string | null;
  feedback: string | null;
};

export type ProspectActionState = {
  type:
    | "send"
    | "awaiting"
    | "viewing"
    | "collect-details"
    | "deploy"
    | "deploying"
    | "live"
    | "declined"
    | "resend"
    | "expired";
  buttonText: string;
  buttonVariant: "default" | "outline" | "secondary" | "destructive";
  icon: ComponentType<{ className?: string }>;
  description?: string;
  priority: number;
};

export function getLatestActiveReview(
  reviews: ProspectReview[]
): ProspectReview | null {
  if (!reviews || reviews.length === 0) return null;

  const priorityOrder: Record<ProspectReviewStatus, number> = {
    LIVE: 1,
    DEPLOYING: 2,
    DETAILS_SUBMITTED: 3,
    APPROVED: 4,
    VIEWED: 5,
    PENDING: 6,
    DECLINED: 7,
    EXPIRED: 8,
  };

  const sorted = [...reviews].sort((a, b) => {
    const priorityDiff = priorityOrder[a.status] - priorityOrder[b.status];
    if (priorityDiff !== 0) return priorityDiff;
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  return sorted[0];
}

export function getProspectActionState(
  reviews: ProspectReview[]
): ProspectActionState {
  const latestReview = getLatestActiveReview(reviews);

  if (!latestReview) {
    return {
      type: "send",
      buttonText: "Send to Prospect",
      buttonVariant: "default",
      icon: IconSend,
      description: "Create a review link for your prospect",
      priority: 10,
    };
  }

  switch (latestReview.status) {
    case "LIVE":
      return {
        type: "live",
        buttonText: "View Live Site",
        buttonVariant: "default",
        icon: IconExternalLink,
        description: "Site is live and accessible",
        priority: 1,
      };

    case "DEPLOYING":
      return {
        type: "deploying",
        buttonText: "Deployment in Progress...",
        buttonVariant: "outline",
        icon: IconLoader,
        description: "Site is being deployed",
        priority: 2,
      };

    case "DETAILS_SUBMITTED":
      return {
        type: "deploy",
        buttonText: "Deploy to Production",
        buttonVariant: "default",
        icon: IconRocket,
        description: "Ready to deploy with provided details",
        priority: 3,
      };

    case "APPROVED":
      if (!latestReview.requestedDomain) {
        return {
          type: "collect-details",
          buttonText: "Collect Domain Details",
          buttonVariant: "default",
          icon: IconFileText,
          description: "Prospect approved - collect deployment details",
          priority: 4,
        };
      }
      return {
        type: "deploy",
        buttonText: "Deploy to Production",
        buttonVariant: "default",
        icon: IconRocket,
        description: "Ready to deploy",
        priority: 3,
      };

    case "VIEWED":
      return {
        type: "viewing",
        buttonText: "Prospect Viewing",
        buttonVariant: "secondary",
        icon: IconEye,
        description: "Waiting for prospect response",
        priority: 5,
      };

    case "PENDING":
      return {
        type: "awaiting",
        buttonText: "Awaiting Response",
        buttonVariant: "outline",
        icon: IconClock,
        description: "Review link sent to prospect",
        priority: 6,
      };

    case "DECLINED":
      return {
        type: "declined",
        buttonText: "Send Revision",
        buttonVariant: "outline",
        icon: IconSend,
        description: "Prospect declined - send updated version",
        priority: 7,
      };

    case "EXPIRED":
      return {
        type: "expired",
        buttonText: "Resend Review",
        buttonVariant: "outline",
        icon: IconRefresh,
        description: "Review link expired",
        priority: 8,
      };

    default:
      return {
        type: "send",
        buttonText: "Send to Prospect",
        buttonVariant: "default",
        icon: IconSend,
        description: "Send review to prospect",
        priority: 10,
      };
  }
}

export function getProspectTimeDescription(review: ProspectReview): string {
  const getTimeDiff = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  switch (review.status) {
    case "VIEWED":
      return review.viewedAt
        ? `Viewed ${getTimeDiff(review.viewedAt)}`
        : "Recently viewed";
    case "APPROVED":
      return review.approvedAt
        ? `Approved ${getTimeDiff(review.approvedAt)}`
        : "Recently approved";
    case "DECLINED":
      return review.declinedAt
        ? `Declined ${getTimeDiff(review.declinedAt)}`
        : "Recently declined";
    case "PENDING":
      return `Sent ${getTimeDiff(review.createdAt)}`;
    default:
      return `Updated ${getTimeDiff(review.createdAt)}`;
  }
}
