import { useCallback, useEffect, useState } from 'react'
import { client } from '../api/client'

interface FetchState<T> {
    data: T | null
    loading: boolean
    error: string | null
}

export function useFetch<T>(path: string) {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: true,
        error: null,
    })

    // path 变化时在渲染期间同步重置状态（React 官方推荐的"渲染期间调整状态"模式，
    // 避免在 useEffect 里同步 setState 触发级联重渲染）
    const [prevPath, setPrevPath] = useState(path)
    if (prevPath !== path) {
        setPrevPath(path)
        setState({ data: null, loading: true, error: null })
    }

    const load = useCallback(() => {
        client
            .get<T>(path)
            .then((data) => setState({ data, loading: false, error: null }))
            .catch((err: unknown) =>
                setState({
                    data: null,
                    loading: false,
                    error: err instanceof Error ? err.message : '请求失败',
                }),
            )
    }, [path])

    useEffect(() => {
        load()
    }, [load])

    const reload = useCallback(() => {
        setState({ data: null, loading: true, error: null })
        load()
    }, [load])

    return { ...state, reload }
}
