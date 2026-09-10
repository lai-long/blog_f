import { useSearchParams } from 'react-router-dom'
import { articleListUrl } from '../../api/article'
import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import type { ArticleListResp } from '../../types'
import ArticleCard from '../../components/ArticleCard'
import Pagination from '../../components/Pagination'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import ErrorState from '../../components/ErrorState'

const PAGE_SIZE = 10

export default function HomePage() {
    useTitle('首页')
    // 页码存在 URL 里（?page=2），刷新/分享链接都能还原
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Math.max(1, Number(searchParams.get('page')) || 1)

    const { data, loading, error, reload } = useFetch<ArticleListResp>(
        articleListUrl(page, PAGE_SIZE),
    )

    return (
        <div className="py-4">
            {loading && <Loading />}
            {!loading && error && <ErrorState message={error} onRetry={reload} />}
            {!loading && !error && data && data.list.length === 0 && <Empty text="暂无文章" />}
            {!loading && !error && data && data.list.length > 0 && (
                <>
                    {data.list.map((a) => <ArticleCard key={a.id} article={a} />)}
                    <Pagination
                        page={page}
                        total={data.total}
                        pageSize={PAGE_SIZE}
                        onChange={(p) => setSearchParams({ page: String(p) })}
                    />
                </>
            )}
        </div>
    )
}
