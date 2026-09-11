import { Link } from 'react-router-dom'
import type { ArticleSummary } from '../types'

export default function ArticleCard({ article }: { article: ArticleSummary }) {
    const date = new Date(article.publishedAt).toLocaleDateString('zh-CN')

    return (
        <article className="border-b border-gray-200 py-6 dark:border-gray-800">
            <Link
                to={`/articles/${article.slug}`}
                className="text-xl font-bold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
            >
                {article.title}
            </Link>
            {article.summary && (
                <p className="mt-2 text-gray-500 dark:text-gray-400">{article.summary}</p>
            )}
            <p className="mt-2 text-sm text-gray-400">
                {date} · {article.views} 次阅读
            </p>
            {article.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
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
        </article>
    )
}
