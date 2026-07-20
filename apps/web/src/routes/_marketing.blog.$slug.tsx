import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { allBlogPosts } from "content-collections"
import MaxWidthWrapper from "@/components/blog/max-width-wrapper"
import Author from "@/components/blog/author"
import { MDX } from "@/components/blog/mdx"
import { getBlurDataURL } from "@/lib/blog/images"
import BlurImage from "@/lib/blog/blur-image"
import { BLOG_CATEGORIES } from "@/lib/blog/content"
import { formatDate } from "@/lib/utils"

export const Route = createFileRoute("/_marketing/blog/$slug")({
  component: BlogArticle,
  loader: ({ params }) => {
    const { slug } = params
    const post = allBlogPosts.find((p) => p.slug === slug)
    if (!post) throw notFound()
    return { slug }
  },
  head: ({ loaderData }) => {
    const post = allBlogPosts.find(
      (p) => p.slug === loaderData.slug,
    )
    if (!post) return {}
    const title = post.seoTitle || post.title
    return {
      meta: [
        {
          title: `${title} – Genia`,
          description: post.seoDescription || post.summary,
        },
      ],
    }
  },
})

function BlogArticle() {
  const { slug } = Route.useParams()
  const data = allBlogPosts.find((post) => post.slug === slug)

  if (!data) {
    throw notFound()
  }

  const imageSources = Array.isArray(data.images) ? data.images : []

  // Note: for server rendering, use loader data. For client, use Suspense.
  const category = BLOG_CATEGORIES.find(
    (cat) => cat.slug === data.categories[0],
  )

  const relatedArticles = (data.related || [])
    .map((s: string) => allBlogPosts.find((post) => post.slug === s))
    .filter(Boolean) as typeof allBlogPosts

  return (
    <>
      <MaxWidthWrapper className="pt-28">
        <div className="flex max-w-screen-md flex-col space-y-4">
          {category && (
            <Link
              to={`/blog/category/${category.slug}`}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              &larr; {category.title}
            </Link>
          )}
          <h1 className="font-display text-3xl font-extrabold text-gray-700 [text-wrap:balance] sm:text-4xl sm:leading-snug">
            {data.title}
          </h1>
          <p className="text-xl text-gray-500">{data.summary}</p>
        </div>
      </MaxWidthWrapper>

      <div className="relative pb-16">
        <div className="absolute top-52 h-[calc(100%-13rem)] w-full border border-gray-200 bg-white/50 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur-lg" />
        <MaxWidthWrapper className="grid grid-cols-4 gap-5 px-0 pt-10 lg:gap-10">
          <div className="relative col-span-4 flex flex-col space-y-8 bg-white sm:rounded-t-xl sm:border sm:border-gray-200 md:col-span-3">
            <BlurImage
              className="aspect-[1200/630] rounded-t-xl object-cover"
              src={data.image}
              blurDataURL={data.image}
              width={1200}
              height={630}
              alt={data.title}
              priority
            />
            <MDX
              code={data.mdx}
              images={imageSources.map((src: string) => ({
                src,
                blurDataURL: src,
                alt: data.title,
              }))}
              className="px-5 pb-20 pt-4 sm:px-10"
            />
          </div>
          <div className="sticky top-20 col-span-1 mt-48 hidden flex-col divide-y divide-gray-200 self-start sm:flex">
            <div className="flex flex-col space-y-4 py-5">
              <p className="text-sm text-gray-500">Written by</p>
              <Author username={data.author} updatedAt={data.publishedAt} />
            </div>
            {relatedArticles.length > 0 && (
              <div className="flex flex-col space-y-4 py-5">
                <p className="text-sm text-gray-500">Read more</p>
                <ul className="flex flex-col space-y-4">
                  {relatedArticles.map((post: any) => (
                    <li key={post.slug}>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="group flex flex-col space-y-2"
                      >
                        <p className="font-semibold text-gray-700 underline-offset-4 group-hover:underline">
                          {post.title}
                        </p>
                        <p className="line-clamp-2 text-sm text-gray-500 underline-offset-2 group-hover:underline">
                          {post.summary}
                        </p>
                        <p className="text-xs text-gray-400 underline-offset-2 group-hover:underline">
                          {formatDate(post.publishedAt)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  )
}
