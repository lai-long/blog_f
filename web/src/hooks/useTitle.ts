import { useEffect } from 'react'

// 每个页面调用一次，把浏览器标签页标题改成「页面名 - 站点名」
export function useTitle(title?: string) {
    useEffect(() => {
        if (title) document.title = `${title} - 我的博客`
    }, [title])
}
