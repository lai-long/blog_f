import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { adminArticleListUrl, deleteArticle, updateArticle } from '../../api/admin'
import { articleDetailUrl } from '../../api/article'
import { client, ApiError } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import type { AdminArticleListResp, AdminArticleSummary, ArticleDetail } from '../../types'
import Pagination from '../../components/Pagination'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import ErrorState from '../../components/ErrorState'

const STATUS_LABEL = ['草稿', '已发布', '已隐藏']
const STATUS_CLS = [
    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
]

export default function AdminArticlesPage() {
    useTitle('文章管理')
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Math.max(1, Number(searchParams.get('page')) || 1)

    const { data, loading, error, reload } = useFetch<AdminArticleListResp>(adminArticleListUrl(page))
    const [operating, setOperating] = useState(false)
    const [opError, setOpError] = useState('')

    // 上下线：发布↔隐藏互切（草稿不在此列，草稿应去编辑页完善后再发布）
    const toggleStatus = async (a: AdminArticleSummary) => {
        const next = a.status === 1 ? 2 : 1
        setOperating(true)
        setOpError('')
        try {
            // 更新接口需要完整字段，先取详情（含 summary/content/cover）再只改 status 提交
            const detail = await client.get<ArticleDetail>(articleDetailUrl(a.slug))
            await updateArticle(a.id, {
                title: detail.title,
                slug: detail.slug,
                summary: detail.summary,
                content: detail.content,
                coverUrl: detail.coverUrl,
                status: next,
            })
            reload()
        } catch (err) {
            setOpError(err instanceof ApiError ? err.message : '操作失败')
        } finally {
            setOperating(false)
        }
    }

    // 删除：二次确认（confirm 是一期最简单可靠的确认方式）
    const remove = async (a: AdminArticleSummary) => {
        if (!window.confirm(`确定删除《${a.title}》吗？此操作不可恢复。`)) return
        setOperating(true)
        setOpError('')
        try {
            await deleteArticle(a.id)
            reload()
        } catch (err) {
            setOpError(err instanceof ApiError ? err.message : '删除失败')
        } finally {
            setOperating(false)
        }
    }

    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">文章管理</h1>
                <Link to="/admin/write" className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700">
                    写文章
                </Link>
            </div>
            {opError && <p className="mt-3 text-sm text-red-500">{opError}</p>}

            {!data || data.list.length === 0 ? (
                <Empty text="还没有文章，去写第一篇吧" />
            ) : (
                <>
                    <table className="mt-4 w-full border-collapse rounded-lg bg-white text-sm dark:bg-gray-900">
                        <thead>
                            <tr className="border-b border-gray-200 text-left text-gray-400 dark:border-gray-800">
                                <th className="px-4 py-3 font-normal">标题</th>
                                <th className="px-4 py-3 font-normal">状态</th>
                                <th className="px-4 py-3 font-normal">阅读量</th>
                                <th className="px-4 py-3 font-normal">更新时间</th>
                                <th className="px-4 py-3 font-normal">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {data.list.map((a) => (
                                <tr key={a.id}>
                                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{a.title}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded px-1.5 py-0.5 text-xs ${STATUS_CLS[a.status]}`}>
                                            {STATUS_LABEL[a.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{a.views}</td>
                                    <td className="px-4 py-3 text-gray-400">
                                        {new Date(a.updatedAt).toLocaleString('zh-CN')}
                                    </td>
                                    <td className="space-x-3 px-4 py-3">
                                        <Link to={`/admin/write/${a.slug}`} className="text-blue-600 hover:underline dark:text-blue-400">
                                            编辑
                                        </Link>
                                        <button type="button" disabled={operating} onClick={() => toggleStatus(a)} className="text-gray-500 hover:underline disabled:opacity-40">
                                            {a.status === 1 ? '下线' : '上线'}
                                        </button>
                                        <button type="button" disabled={operating} onClick={() => remove(a)} className="text-red-500 hover:underline disabled:opacity-40">
                                            删除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={page} total={data.total} pageSize={10} onChange={(p) => setSearchParams({ page: String(p) })} />
                </>
            )}
        </div>
    )
}
