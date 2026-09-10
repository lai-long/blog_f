import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createArticle, updateArticle, uploadImage } from '../../api/admin'
import { articleDetailUrl } from '../../api/article'
import { client, ApiError } from '../../api/client'
import { useTitle } from '../../hooks/useTitle'
import type { ArticleDetail } from '../../types'
import MarkdownRenderer from '../../components/MarkdownRenderer'
import Loading from '../../components/Loading'

// 写作页：/admin/write 新建，/admin/write/:slug 编辑（复用同一组件）
export default function WritePage() {
    const { slug: editSlug } = useParams<{ slug: string }>()
    const isEdit = Boolean(editSlug)
    useTitle(isEdit ? '编辑文章' : '写文章')
    const navigate = useNavigate()

    const [id, setId] = useState(0)
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [summary, setSummary] = useState('')
    const [coverUrl, setCoverUrl] = useState('')
    const [content, setContent] = useState('')
    const [status, setStatus] = useState(0)

    const [pageLoading, setPageLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    // 编辑模式：加载已有文章填充表单
    useEffect(() => {
        if (!editSlug) return
        client
            .get<ArticleDetail>(articleDetailUrl(editSlug))
            .then((a) => {
                setId(a.id)
                setTitle(a.title)
                setSlug(a.slug)
                setSummary(a.summary ?? '')
                setCoverUrl(a.coverUrl ?? '')
                setContent(a.content)
                setStatus(1) // 公开接口只能查到已发布文章，能查到即为已发布
            })
            .catch((err: unknown) => setError(err instanceof ApiError ? err.message : '加载失败'))
            .finally(() => setPageLoading(false))
    }, [editSlug])

    const save = async (nextStatus: number) => {
        setSaving(true)
        setError('')
        try {
            const body = { title, slug, summary, content, coverUrl, status: nextStatus }
            if (isEdit) await updateArticle(id, body)
            else await createArticle(body)
            navigate('/admin/articles')
        } catch (err) {
            // slug 冲突等后端错误直接显示其 message
            setError(err instanceof ApiError ? err.message : '保存失败')
        } finally {
            setSaving(false)
        }
    }

    const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setError('')
        try {
            const resp = await uploadImage(file)
            setCoverUrl(resp.url)
        } catch (err) {
            setError(err instanceof ApiError ? err.message : '上传失败')
        } finally {
            setUploading(false)
        }
    }

    if (pageLoading) return <Loading />

    const inputCls = 'rounded border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900'

    return (
        <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{isEdit ? '编辑文章' : '写文章'}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" required className={`${inputCls} w-64`} />
                <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug（URL 用，如 my-first-post）" required className={`${inputCls} w-64`} />
                <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="摘要（可选）" className={`${inputCls} w-64`} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
                <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="封面图 URL（可选）" className={`${inputCls} w-96`} />
                <label className="cursor-pointer rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                    {uploading ? '上传中…' : '上传封面'}
                    <input type="file" accept="image/*" onChange={uploadCover} className="hidden" />
                </label>
                {coverUrl && <img src={coverUrl} alt="封面预览" className="h-16 rounded" />}
            </div>

            {/* 分屏：左编辑右预览 */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="用 Markdown 写作…"
                    className={`${inputCls} h-[60vh] w-full resize-none font-mono`}
                />
                <div className="h-[60vh] overflow-y-auto rounded border border-gray-300 px-4 dark:border-gray-700">
                    {content ? <MarkdownRenderer content={content} /> : <p className="py-8 text-center text-gray-400">预览区</p>}
                </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-4 flex items-center gap-3">
                <button type="button" disabled={saving || !title || !slug || !content} onClick={() => save(0)} className="rounded border border-gray-300 px-4 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800">
                    存草稿
                </button>
                <button type="button" disabled={saving || !title || !slug || !content} onClick={() => save(1)} className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-40">
                    {saving ? '保存中…' : status === 1 ? '保存并发布' : '发布'}
                </button>
            </div>
        </div>
    )
}
