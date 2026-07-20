import { createFileRoute } from "@tanstack/react-router"
import { getBlurDataURL } from "@/lib/blog/images"
import BlogCard from "@/components/blog/blog-card"
import BlogLayoutHero from "@/components/blog/blog-layout-hero"
import MaxWidthWrapper from "@/components/blog/max-width-wrapper"
import { allBlogPosts } from "content-collections"

export const Route = createFileRoute("/_marketing/blog/")({
  component: Blog,
  head: () => ({
    meta: [
      {
        title: "Genia Blog",
        description:
          "Read Genia product updates, agency playbooks, and AI website building insights to keep your launch strategy sharp and your workflows modern.",
      },
    ],
  }),
})

async function Blog() {
  const articles = await Promise.all(
    allBlogPosts
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map(async (post) => ({
        ...post,
        blurDataURL: await getBlurDataURL(post.image),
      })),
  )

  return (
    <>
      <BlogLayoutHero />
      <div className="min-h-[50vh] border border-gray-200 bg-white/50 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur-lg">
        <MaxWidthWrapper className="grid grid-cols-1 gap-8 py-10 md:grid-cols-2">
          {articles.map((article, idx) => (
            <BlogCard key={article.slug} data={article} priority={idx <= 1} />
          ))}
        </MaxWidthWrapper>
      </div>
    </>
  )
}
