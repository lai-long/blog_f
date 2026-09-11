import { useParams } from 'react-router-dom'
import { articleListUrl } from '../../api/article'
import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import type { ArticleListResp } from '../../types'
import ArticleCard from '../../components/ArticleCard'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import ErrorState from '../../components/ErrorState'

export default function TagArticlesPage() {
    const { slug } = useParams<{ slug: string }>()
    const tag = slug ?? ''
    useTitle(`标签：${tag}`)

    const { data, loading, error, reload } = useFetch<ArticleListResp>(
        tag ? articleListUrl(1, 20, undefined, tag) : null,
    )

    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />

    return (
        <div className="py-4">
            <h1 className="px-0 py-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                标签：{decodeURIComponent(tag)}
                {data && <span className="ml-2 text-base font-normal text-gray-400">共 {data.total} 篇</span>}
            </h1>
            {(!data || data.list.length === 0) && <Empty text="该标签下暂无文章" />}
            {data && data.list.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
    )
}
