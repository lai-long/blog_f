import { Link } from 'react-router-dom'
import { tagListUrl } from '../../api/tag'
import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import type { TagListResp } from '../../types'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import ErrorState from '../../components/ErrorState'

export default function TagsPage() {
    useTitle('标签')
    const { data, loading, error, reload } = useFetch<TagListResp>(tagListUrl())

    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />
    if (!data || data.list.length === 0) return <Empty text="暂无标签" />

    return (
        <div className="mx-auto max-w-[720px] py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">标签</h1>
            <div className="mt-6 flex flex-wrap gap-3">
                {data.list.map((t) => (
                    <Link
                        key={t.slug}
                        to={`/tags/${encodeURIComponent(t.slug)}`}
                        className="rounded-full border border-gray-300 px-4 py-1.5 text-sm hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:text-blue-400"
                    >
                        {t.name}
                        <span className="ml-1.5 text-gray-400">{t.count}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
