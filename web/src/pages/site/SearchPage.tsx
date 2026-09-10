import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { articleListUrl } from '../../api/article'
import { useFetch } from '../../hooks/useFetch'
import { useDebounce } from '../../hooks/useDebounce'
import { useTitle } from '../../hooks/useTitle'
import type { ArticleListResp } from '../../types'
import ArticleCard from '../../components/ArticleCard'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import ErrorState from '../../components/ErrorState'

export default function SearchPage() {
    useTitle('搜索')

    // URL 是搜索词的唯一事实来源（?q=xxx），刷新/分享链接都能还原
    const [searchParams, setSearchParams] = useSearchParams()
    const q = searchParams.get('q') ?? ''

    // input 跟着手指即时更新；防抖后的值才写进 URL 并触发请求
    const [input, setInput] = useState(q)
    const debouncedInput = useDebounce(input)

    useEffect(() => {
        // replace 模式：连续输入不会在历史记录里留下一堆中间状态，后退一次就离开搜索页
        setSearchParams(debouncedInput ? { q: debouncedInput } : {}, { replace: true })
    }, [debouncedInput, setSearchParams])

    const { data, loading, error, reload } = useFetch<ArticleListResp>(
        q ? articleListUrl(1, 20, q) : null,
    )

    return (
        <div className="mx-auto max-w-[720px] py-8">
            <input
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入关键词搜索文章…"
                className="w-full rounded border border-gray-300 bg-transparent px-4 py-2 outline-none focus:border-blue-500 dark:border-gray-700"
            />

            {!q && <p className="py-8 text-center text-gray-400">输入关键词开始搜索</p>}

            {q && loading && <Loading />}
            {q && !loading && error && <ErrorState message={error} onRetry={reload} />}
            {q && !loading && !error && data && (
                data.list.length === 0 ? (
                    <Empty text={`没有找到与「${q}」相关的文章`} />
                ) : (
                    <>
                        <p className="mt-4 text-sm text-gray-400">
                            找到 {data.total} 篇与「{q}」相关的文章
                        </p>
                        {data.list.map((a) => <ArticleCard key={a.id} article={a} />)}
                    </>
                )
            )}
        </div>
    )
}
