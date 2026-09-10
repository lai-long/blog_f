import { useEffect } from 'react'

// 动态注入 <meta> 标签（SEO / og 分享卡片用），组件卸载时移除
// 用法：useMeta({ description: '...', 'og:title': '...' })
export function useMeta(tags: Record<string, string> | null) {
    useEffect(() => {
        if (!tags) return
        const added: HTMLMetaElement[] = []
        for (const [key, content] of Object.entries(tags)) {
            const meta = document.createElement('meta')
            if (key.startsWith('og:')) meta.setAttribute('property', key)
            else meta.setAttribute('name', key)
            meta.content = content
            document.head.appendChild(meta)
            added.push(meta)
        }
        return () => added.forEach((m) => m.remove())
    }, [tags])
}
