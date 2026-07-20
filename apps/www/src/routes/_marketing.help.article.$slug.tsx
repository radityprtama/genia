import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import SearchButton from "@workspace/ui/components/blog/search-button";
import MaxWidthWrapper from "@workspace/ui/components/blog/max-width-wrapper";
import { type HelpPost, allHelpPosts } from "content-collections";
import { ChevronRight } from "lucide-react";
import { HELP_CATEGORIES } from "@/lib/blog/content";
import Author from "@workspace/ui/components/blog/author";
import { MDX } from "@workspace/ui/components/blog/mdx";
import TableOfContents from "@workspace/ui/components/blog/table-of-contents";
import Feedback from "@workspace/ui/components/blog/feedback";
import HelpArticleLink from "@workspace/ui/components/blog/help-article-link";
import { getBlurDataURL } from "@/lib/blog/images";

export const Route = createFileRoute("/_marketing/help/article/$slug")({
  loader: async ({ params }) => {
    const data = allHelpPosts.find((post) => post.slug === params.slug);
    if (!data) {
      throw notFound();
    }
    const category = HELP_CATEGORIES.find(
      (cat) => data.categories[0] === cat.slug
    );
    if (!category) {
      throw notFound();
    }

    const imageSources = Array.isArray(data.images) ? data.images : [];

    const images = await Promise.all(
      imageSources.map(async (src: string) => ({
        src,
        blurDataURL: await getBlurDataURL(src),
      }))
    );

    const relatedArticles =
      ((data.related &&
        data.related
          .map((slug) => allHelpPosts.find((post) => post.slug === slug))
          .filter(Boolean)) as HelpPost[]) || [];

    return { data, category, images, relatedArticles, slug: params.slug };
  },
  component: HelpArticle,
});

function HelpArticle() {
  const { data, category, images, relatedArticles, slug } = Route.useLoaderData();

  return (
    <>
      <MaxWidthWrapper className="flex max-w-screen-lg flex-col py-10 mt-28">
        <SearchButton />
      </MaxWidthWrapper>

      <div className=" bg-white/50 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur-lg">
        <MaxWidthWrapper className="grid max-w-screen-lg grid-cols-4 gap-10 py-10">
          <div className="col-span-4 flex flex-col space-y-8 sm:col-span-3 sm:pr-10">
            <div className="flex items-center space-x-2">
              <Link
                to="/help"
                className="whitespace-nowrap text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                All Categories
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <Link
                to="/help"
                params={{}}
                className="whitespace-nowrap text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                {category.title}
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="truncate text-sm font-medium text-gray-500">
                {data.title}
              </span>
            </div>
            <div className="flex flex-col space-y-4">
              <h1 className="font-display text-3xl font-bold !leading-snug sm:text-4xl">
                {data.title}
              </h1>
              <p className="text-gray-500">{data.summary}</p>
              <Author username={data.author} updatedAt={data.updatedAt} />
            </div>
            <MDX code={data.mdx} images={images} />
            {relatedArticles.length > 0 && (
              <div className="flex flex-col space-y-4 border-t border-gray-200 pt-8">
                <h2 className="font-display text-xl font-bold sm:text-2xl">
                  Related Articles
                </h2>
                <div className="grid gap-2 rounded-xl border border-gray-200 bg-white p-4">
                  {relatedArticles.map((article) => (
                    <HelpArticleLink key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            )}
            <Feedback />
          </div>
          <div className="sticky top-20 col-span-1 hidden flex-col space-y-10 divide-y divide-gray-200 self-start sm:flex">
            {data.tableOfContents.length > 0 && (
              <TableOfContents items={data.tableOfContents} />
            )}
            <div className="flex justify-center pt-5">
              <a
                href={`https://github.com/Codehagen/social-forge/blob/main/content/help/${slug}.mdx`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 transition-colors hover:text-gray-800"
              >
                Found a typo? Edit this page ↗
              </a>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}
