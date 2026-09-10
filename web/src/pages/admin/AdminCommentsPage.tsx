import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { adminCommentListUrl, auditComment, deleteComment } from '../../api/admin'
import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import { ApiError } from '../../api/client'
import type { AdminComment, AdminCommentListResp } from '../../types'
import CommentForm from '../../components/CommentForm'
import Pagination from '../../components/Pagination'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import ErrorState from '../../components/ErrorState'

const TABS = [
    { status: -1, label: '全部' },
    { status: 0, label: '待审核' },
    { status: 1, label: '已通过' },
    { status: 2, label: '垃圾' },
]
const STATUS_LABEL = ['待审核', '已通过', '垃圾']

export default function AdminCommentsPage() {
    useTitle('评论管理')
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const status = Number(searchParams.get('status') ?? -1)

    const { data, loading, error, reload } = useFetch<AdminCommentListResp>(
        adminCommentListUrl(page, 10, status),
    )
    const [opError, setOpError] = useState('')
    const [replyTo, setReplyTo] = useState<AdminComment | null>(null)

    const run = async (fn: () => Promise<unknown>) => {
        setOpError('')
        try {
            await fn()
            reload()
        } catch (err) {
            setOpError(err instanceof ApiError ? err.message : '操作失败')
        }
    }

    const remove = (c: AdminComment) => {
        if (window.confirm(`确定删除 ${c.nickname} 的这条评论吗？`)) {
            run(() => deleteComment(c.id))
        }
    }

    const setTab = (s: number) => {
        setSearchParams(s === -1 ? {} : { status: String(s) })
    }

    return (
        <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">评论管理</h1>

            <div className="mt-4 flex gap-2">
                {TABS.map((t) => (
                    <button
                        key={t.status}
                        type="button"
                        onClick={() => setTab(t.status)}
                        className={`rounded px-3 py-1 text-sm ${
                            status === t.status
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            {opError && <p className="mt-3 text-sm text-red-500">{opError}</p>}

            {loading && <Loading />}
            {!loading && error && <ErrorState message={error} onRetry={reload} />}
            {!loading && !error && data && data.list.length === 0 && <Empty text="没有评论" />}
            {!loading && !error && data && data.list.length > 0 && (
                <>
                    <ul className="mt-4 space-y-3">
                        {data.list.map((c) => (
                            <li key={c.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                                <p className="text-sm">
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{c.nickname}</span>
                                    <span className="ml-2 text-gray-400">{new Date(c.createdAt).toLocaleString('zh-CN')}</span>
                                    <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                        {STATUS_LABEL[c.status]}
                                    </span>
                                    <Link to={`/articles/${c.articleSlug}`} className="ml-2 text-sm text-blue-600 hover:underline dark:text-blue-400">
                                        《{c.articleTitle}》
                                    </Link>
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{c.content}</p>
                                <div className="mt-2 space-x-3 text-sm">
                                    {c.status === 0 && (
                                        <button type="button" onClick={() => run(() => auditComment(c.id, 1))} className="text-green-600 hover:underline">
                                            通过
                                        </button>
                                    )}
                                    {c.status !== 2 && (
                                        <button type="button" onClick={() => run(() => auditComment(c.id, 2))} className="text-yellow-600 hover:underline">
                                            标垃圾
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setReplyTo(replyTo?.id === c.id ? null : c)} className="text-blue-600 hover:underline dark:text-blue-400">
                                        回复
                                    </button>
                                    <button type="button" onClick={() => remove(c)} className="text-red-500 hover:underline">
                                        删除
                                    </button>
                                </div>
                                {replyTo?.id === c.id && (
                                    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                                        {/* 管理员回复复用游客发表表单；走后端默认昵称即博主身份 */}
                                        <CommentForm slug={c.articleSlug} parentId={c.id} onCancel={() => setReplyTo(null)} />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <Pagination page={page} total={data.total} pageSize={10} onChange={(p) => setSearchParams({ ...(status !== -1 ? { status: String(status) } : {}), page: String(p) })} />
                </>
            )}
        </div>
    )
}
