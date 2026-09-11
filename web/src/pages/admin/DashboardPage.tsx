import { adminArticleListUrl, adminCommentListUrl, adminStatsUrl } from '../../api/admin'
import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import type { AdminArticleListResp, AdminCommentListResp, VisitStatsResp } from '../../types'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'

export default function DashboardPage() {
    useTitle('仪表盘')

    // 后端暂无独立统计接口，用现有列表接口组合出数字（一期文章量小，一次拉全量）
    const articles = useFetch<AdminArticleListResp>(adminArticleListUrl(1, 1000))
    const pending = useFetch<AdminCommentListResp>(adminCommentListUrl(1, 1, 0))
    const latest = useFetch<AdminCommentListResp>(adminCommentListUrl(1, 5))
    const stats = useFetch<VisitStatsResp>(adminStatsUrl())

    if (articles.loading || pending.loading || latest.loading) return <Loading />
    if (articles.error) return <ErrorState message={articles.error} onRetry={articles.reload} />
    if (pending.error) return <ErrorState message={pending.error} onRetry={pending.reload} />
    if (latest.error) return <ErrorState message={latest.error} onRetry={latest.reload} />

    const totalViews = articles.data?.list.reduce((sum, a) => sum + a.views, 0) ?? 0

    const cards = [
        { label: '文章总数', value: articles.data?.total ?? 0 },
        { label: '总阅读量', value: totalViews },
        { label: '待审核评论', value: pending.data?.total ?? 0 },
    ]

    const visitCards = [
        { label: '今日 PV', value: stats.data?.todayPv ?? '-' },
        { label: '今日 UV', value: stats.data?.todayUv ?? '-' },
        { label: '累计 PV', value: stats.data?.totalPv ?? '-' },
        { label: '累计 UV', value: stats.data?.totalUv ?? '-' },
    ]

    const trend = stats.data?.trend ?? []
    const maxPv = Math.max(...trend.map((d) => d.pv), 1) // 至少 1，避免除零

    return (
        <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">仪表盘</h1>
            <div className="mt-6 grid grid-cols-3 gap-4">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-sm text-gray-400">{c.label}</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4">
                {visitCards.map((c) => (
                    <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-sm text-gray-400">{c.label}</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{c.value}</p>
                    </div>
                ))}
            </div>

            {/* 最近 7 天 PV 趋势：纯 div 柱状图，不引图表库 */}
            {trend.length > 0 && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-sm text-gray-400">最近 7 天访问量（PV）</p>
                    <div className="mt-4 flex h-32 items-end gap-2">
                        {trend.map((d) => (
                            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                                <span className="text-xs text-gray-400">{d.pv > 0 ? d.pv : ''}</span>
                                <div
                                    className="w-full rounded-t bg-blue-500/80"
                                    style={{ height: `${Math.max((d.pv / maxPv) * 100, d.pv > 0 ? 4 : 1)}%` }}
                                    title={`${d.date}：PV ${d.pv} / UV ${d.uv}`}
                                />
                                <span className="text-xs text-gray-400">{d.date.slice(5)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h2 className="mt-8 font-bold text-gray-900 dark:text-gray-100">最新评论</h2>
            <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
                {latest.data?.list.length === 0 && (
                    <li className="p-4 text-sm text-gray-400">暂无评论</li>
                )}
                {latest.data?.list.map((c) => (
                    <li key={c.id} className="p-4 text-sm">
                        <span className="font-bold">{c.nickname}</span>
                        <span className="mx-2 text-gray-400">在《{c.articleTitle}》</span>
                        {c.status === 0 && <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">待审核</span>}
                        <p className="mt-1 text-gray-500 dark:text-gray-400">{c.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
