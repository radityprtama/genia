import { createFileRoute, notFound } from "@tanstack/react-router"
import { allBlogPosts } from "content-collections"
import { BLOG_CATEGORIES } from "@/lib/blog/content"
import { getBlurDataURL } from "@/lib/blog/images"
import BlogCard from "@workspace/ui/components/blog/blog-card"

export const Route = createFileRoute("/_marketing/blog/category/$slug")({
  component: BlogCategory,
  loader: ({ params }) => {
    const { slug } = params
    return { slug }
  },
  head: ({ loaderData }) => {
    const category = BLOG_CATEGORIES.find(
      (c) => c.slug === loaderData.slug,
    )
    if (!category) return {}
    return {
      meta: [
        {
          title: `${category.title} – Genia Blog`,
          description:
            category.description ||
            "Explore curated stories, walkthroughs, and best practices from the Genia blog.",
        },
      ],
    }
  },
})

function BlogCategory() {
  const { slug } = Route.useParams()
  const data = BLOG_CATEGORIES.find((category) => category.slug === slug)

  if (!data) {
    throw notFound()
  }

  // @ts-expect-error - content-collections types
  const articles = allBlogPosts
    .filter((post) => post.categories.includes(data.slug))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  return (
    <div className="min-h-[50vh] border border-gray-200 bg-white/50 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur-lg">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-gray-700 mb-8">
          {data.title}
        </h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {articles.map((article: any, idx: number) => (
            <BlogCard
              key={article.slug}
              data={article}
              priority={idx <= 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
