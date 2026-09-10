import { useState } from 'react'
import { createComment } from '../api/interact'
import { ApiError } from '../api/client'

interface CommentFormProps {
    slug: string
    parentId?: number // 回复某条评论时带上
    onCancel?: () => void
}

// 游客可发表（昵称可选填）；发表后进待审核，公开列表只显示已通过的
export default function CommentForm({ slug, parentId, onCancel }: CommentFormProps) {
    const [nickname, setNickname] = useState('')
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState('')

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return
        setSubmitting(true)
        setError('')
        try {
            await createComment(slug, {
                content: content.trim(),
                ...(nickname.trim() ? { nickname: nickname.trim() } : {}),
                ...(parentId ? { parentId } : {}),
            })
            setDone(true)
            setContent('')
        } catch (err) {
            setError(err instanceof ApiError ? err.message : '发表失败，请稍后再试')
        } finally {
            setSubmitting(false)
        }
    }

    if (done) {
        return <p className="rounded bg-green-50 p-4 text-green-700 dark:bg-green-950 dark:text-green-400">已提交，待审核通过后显示</p>
    }

    const inputCls = 'rounded border border-gray-300 bg-transparent px-3 py-1.5 outline-none focus:border-blue-500 dark:border-gray-700'

    return (
        <form onSubmit={submit} className="space-y-3">
            {!parentId && (
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="昵称（可选）"
                    maxLength={20}
                    className={`${inputCls} w-48 text-sm`}
                />
            )}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的评论…"
                rows={3}
                required
                className={`${inputCls} block w-full`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-40"
                >
                    {submitting ? '提交中…' : '发表评论'}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="rounded border border-gray-300 px-4 py-1.5 text-sm dark:border-gray-700">
                        取消
                    </button>
                )}
            </div>
        </form>
    )
}
