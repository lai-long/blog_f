import { useEffect, useState } from 'react'

// 输入防抖：value 变化后延迟 delay 毫秒才更新返回值；
// 连续输入时计时器不断重置，只有停下来才触发——避免每敲一个字就发一次请求
export function useDebounce<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer) // 下次变化/卸载时取消上一个计时器
    }, [value, delay])

    return debounced
}
