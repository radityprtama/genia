import { createFileRoute, notFound } from "@tanstack/react-router";
import { allLegalPosts } from "content-collections";
import MaxWidthWrapper from "@workspace/ui/components/blog/max-width-wrapper";
import { MDX } from "@workspace/ui/components/blog/mdx";

export const Route = createFileRoute("/_marketing/$slug")({
  loader: async ({ params }) => {
    const data = allLegalPosts.find((post) => post.slug === params.slug);
    if (!data) {
      throw notFound();
    }
    return { data };
  },
  component: LegalPage,
});

function LegalPage() {
  const { data } = Route.useLoaderData();

  return (
    <MaxWidthWrapper className="py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 space-y-4">
          <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {data.title}
          </h1>
          <p className="text-sm text-gray-500">
            Last updated:{" "}
            {new Date(data.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <MDX code={data.mdx} />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
