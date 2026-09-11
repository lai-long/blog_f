import { useParams, Link } from 'react-router-dom'
import { articleDetailUrl } from '../../api/article'
import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import { useMeta } from '../../hooks/useMeta'
import type { ArticleDetail } from '../../types'
import MarkdownRenderer from '../../components/MarkdownRenderer'
import Toc from '../../components/Toc'
import CommentSection from '../../components/CommentSection'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import ErrorState from '../../components/ErrorState'

export default function ArticlePage() {
    // :slug 是路由参数，/articles/hello-world → slug = "hello-world"
    const { slug } = useParams<{ slug: string }>()
    const { data: article, loading, error, reload } = useFetch<ArticleDetail>(
        articleDetailUrl(slug ?? ''),
    )
    useTitle(article?.title)
    // SEO / 分享卡片：摘要取 summary，缺省截取正文纯文本前 100 字
    const description = article
        ? (article.summary ?? article.content.replace(/[#*`>[\]()\\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100))
        : ''
    useMeta(
        article
            ? {
                  description,
                  'og:title': article.title,
                  'og:description': description,
                  'og:type': 'article',
                  ...(article.coverUrl ? { 'og:image': article.coverUrl } : {}),
              }
            : null,
    )

    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />
    if (!article) return <Empty text="文章不存在或已下线" />

    const date = new Date(article.publishedAt).toLocaleDateString('zh-CN')

    return (
        <div className="py-8">
            <Toc content={article.content} />
            {/* 正文最大宽度 720px（设计文档 6 章），居中 */}
            <div className="mx-auto max-w-[720px]">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{article.title}</h1>
                <p className="mt-2 text-sm text-gray-400">
                    {date} · {article.views} 次阅读
                </p>
                {article.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {article.tags.map((t) => (
                            <Link
                                key={t.slug}
                                to={`/tags/${encodeURIComponent(t.slug)}`}
                                className="rounded-full border border-gray-300 px-2 py-0.5 text-xs hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:text-blue-400"
                            >
                                {t.name}
                            </Link>
                        ))}
                    </div>
                )}
                <div className="mt-8">
                    <MarkdownRenderer content={article.content} />
                </div>
                {/* B7：评论区 */}
                <CommentSection slug={article.slug} />
            </div>
        </div>
    )
}
