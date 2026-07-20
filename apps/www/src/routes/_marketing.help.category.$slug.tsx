import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { allHelpPosts } from "content-collections";
import { POPULAR_ARTICLES, HELP_CATEGORIES } from "@/lib/blog/content";
import MaxWidthWrapper from "@workspace/ui/components/blog/max-width-wrapper";
import SearchButton from "@workspace/ui/components/blog/search-button";
import { ChevronRight } from "lucide-react";
import HelpArticleLink from "@workspace/ui/components/blog/help-article-link";

export const Route = createFileRoute("/_marketing/help/category/$slug")({
  loader: async ({ params }) => {
    const data = HELP_CATEGORIES.find((category) => category.slug === params.slug);
    if (!data) {
      throw notFound();
    }
    const articles = allHelpPosts
      .filter((post) => post.categories.includes(data.slug))
      .reduce(
        (acc, curr) => {
          if (POPULAR_ARTICLES.includes(curr.slug)) {
            acc.unshift(curr);
          } else {
            acc.push(curr);
          }
          return acc;
        },
        [] as typeof allHelpPosts
      );

    return { data, articles };
  },
  component: HelpCategory,
});

function HelpCategory() {
  const { data, articles } = Route.useLoaderData();

  return (
    <>
      <MaxWidthWrapper className="flex max-w-screen-lg flex-col py-10 mt-28">
        <SearchButton />
      </MaxWidthWrapper>

      <div className="min-h-[50vh] border border-gray-200 bg-white/50 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur-lg">
        <MaxWidthWrapper className="flex max-w-screen-lg flex-col py-10">
          <div className="flex items-center space-x-2">
            <Link
              to="/help"
              className="text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              All Categories
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500">
              {data.title}
            </span>
          </div>
          <div className="my-8 flex flex-col space-y-4">
            <h1 className="font-display text-2xl font-bold sm:text-4xl">
              {data.title}
            </h1>
            <p className="text-gray-500">{data.description}</p>
          </div>
          <div className="grid gap-2 rounded-xl border border-gray-200 bg-white p-4">
            {articles.map((article) => (
              <HelpArticleLink key={article.slug} article={article} />
            ))}
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}
