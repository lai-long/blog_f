import { useEffect, useState } from 'react'
import { extractToc } from '../utils/toc'

// 文章目录：点击平滑跳转，滚动时高亮当前所在节
export default function Toc({ content }: { content: string }) {
    const items = extractToc(content)
    const [activeId, setActiveId] = useState<string>('')

    useEffect(() => {
        // IntersectionObserver：浏览器原生 API，监听元素进出视口，比监听 scroll 事件性能更好
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) setActiveId(entry.target.id)
                }
            },
            // 视口上方留 80px（顶栏高度），底部裁掉 70%，让"当前节"大致是屏幕上方正在读的节
            { rootMargin: '-80px 0px -70% 0px' },
        )
        document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3')
            .forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [content])

    if (items.length === 0) return null

    const jump = (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <nav className="mb-8 rounded border border-gray-200 p-4 text-sm dark:border-gray-800 xl:fixed xl:top-24 xl:right-8 xl:mb-0 xl:w-56">
            <p className="mb-2 font-bold text-gray-900 dark:text-gray-100">目录</p>
            {items.map((item) => (
                <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => jump(e, item.id)}
                    className={`block truncate py-0.5 hover:text-blue-600 dark:hover:text-blue-400 ${
                        item.level === 2 ? 'pl-4' : item.level === 3 ? 'pl-8' : ''
                    } ${
                        activeId === item.id
                            ? 'font-bold text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                    {item.text}
                </a>
            ))}
        </nav>
    )
}
