import { Link } from 'react-router-dom'
import { articleListUrl } from '../../api/article'
import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import type { ArticleSummary, ArticleListResp } from '../../types'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import ErrorState from '../../components/ErrorState'

// 按 年 → 月 分组；列表接口本身按发布时间倒序，分组内顺序天然正确
function groupByYearMonth(list: ArticleSummary[]) {
    const groups: { year: number; months: { month: number; items: ArticleSummary[] }[] }[] = []
    for (const a of list) {
        const d = new Date(a.publishedAt)
        const year = d.getFullYear()
        const month = d.getMonth() + 1
        let yearGroup = groups.find((g) => g.year === year)
        if (!yearGroup) {
            yearGroup = { year, months: [] }
            groups.push(yearGroup)
        }
        let monthGroup = yearGroup.months.find((m) => m.month === month)
        if (!monthGroup) {
            monthGroup = { month, items: [] }
            yearGroup.months.push(monthGroup)
        }
        monthGroup.items.push(a)
    }
    return groups
}

export default function ArchivePage() {
    useTitle('归档')
    // 一期文章量小，一次拉全量前端分组；文章多了再考虑后端出归档接口
    const { data, loading, error, reload } = useFetch<ArticleListResp>(articleListUrl(1, 100))

    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />
    if (!data || data.list.length === 0) return <Empty text="暂无文章" />

    const groups = groupByYearMonth(data.list)

    return (
        <div className="mx-auto max-w-[720px] py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                归档 <span className="text-base font-normal text-gray-400">共 {data.total} 篇</span>
            </h1>
            {groups.map((g) => (
                <section key={g.year} className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{g.year} 年</h2>
                    {g.months.map((m) => (
                        <div key={m.month} className="mt-3">
                            <h3 className="text-sm text-gray-400">{m.month} 月</h3>
                            <ul className="mt-1 border-l-2 border-gray-200 dark:border-gray-800">
                                {m.items.map((a) => (
                                    <li key={a.id} className="flex items-baseline gap-3 py-1.5 pl-4">
                                        <span className="shrink-0 text-sm text-gray-400">
                                            {new Date(a.publishedAt).getDate()} 日
                                        </span>
                                        <Link
                                            to={`/articles/${a.slug}`}
                                            className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                                        >
                                            {a.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            ))}
        </div>
    )
}
