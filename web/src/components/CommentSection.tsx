import { useState } from 'react'
import { commentListUrl } from '../api/interact'
import { useFetch } from '../hooks/useFetch'
import type { CommentListResp } from '../types'
import CommentList from './CommentList'
import CommentForm from './CommentForm'
import Loading from './Loading'
import ErrorState from './ErrorState'

// 评论区整体：列表 + 游客发表表单 + 回复目标管理
export default function CommentSection({ slug }: { slug: string }) {
    const { data, loading, error, reload } = useFetch<CommentListResp>(commentListUrl(slug))
    const [replyTo, setReplyTo] = useState<number | undefined>(undefined)

    const replyNickname = replyTo
        ? data?.list.find((c) => c.id === replyTo)?.nickname
        : undefined

    return (
        <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                评论{data ? `（${data.total}）` : ''}
            </h2>

            <div className="mt-6">
                {loading && <Loading />}
                {!loading && error && <ErrorState message={error} onRetry={reload} />}
                {!loading && !error && data && data.list.length === 0 && (
                    <p className="py-4 text-gray-400">还没有评论，来抢沙发</p>
                )}
                {!loading && !error && data && data.list.length > 0 && (
                    <CommentList comments={data.list} onReply={(id) => setReplyTo(id)} />
                )}
            </div>

            <div className="mt-6">
                {replyTo && (
                    <p className="mb-2 text-sm text-gray-400">
                        回复 @{replyNickname}：
                        <button type="button" className="ml-2 text-blue-600 dark:text-blue-400" onClick={() => setReplyTo(undefined)}>
                            取消回复
                        </button>
                    </p>
                )}
                <CommentForm slug={slug} parentId={replyTo} onCancel={replyTo ? () => setReplyTo(undefined) : undefined} />
            </div>
        </section>
    )
}
