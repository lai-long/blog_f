import { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import ErrorState from '../../components/ErrorState'

// 假数据源：1 秒后按场景返回不同结果
type Scene = 'success' | 'empty' | 'error'

function fakeFetch(scene: Scene): Promise<string[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (scene === 'success') resolve(['文章一', '文章二'])
            else if (scene === 'empty') resolve([])
            else reject(new Error('服务器开小差了'))
        }, 1000)
    })
}

export default function HomePage() {
    const [scene, setScene] = useState<Scene>('success')
    const [data, setData] = useState<string[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // 状态重置放在事件回调里做，useEffect 里只做异步请求，避免同步 setState 的级联渲染
    const switchScene = (s: Scene) => {
        setScene(s)
        setLoading(true)
        setError(null)
    }

    useEffect(() => {
        fakeFetch(scene)
            .then((list) => setData(list))
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false))
    }, [scene])

    return (
        <div className="p-8">
            <div className="mb-6 flex gap-2">
                <button className="rounded border px-3 py-1" onClick={() => setScene('success')}>成功</button>
                <button className="rounded border px-3 py-1" onClick={() => setScene('empty')}>空数据</button>
                <button className="rounded border px-3 py-1" onClick={() => setScene('error')}>出错</button>
            </div>

            {loading && <Loading />}
            {!loading && error && <ErrorState message={error} onRetry={() => setScene(scene)} />}
            {!loading && !error && data && data.length === 0 && <Empty text="暂无文章" />}
            {!loading && !error && data && data.length > 0 && (
                <ul className="list-disc pl-6">
                    {data.map((title) => <li key={title}>{title}</li>)}
                </ul>
            )}
        </div>
    )
}
