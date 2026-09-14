import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { trackVisit } from '../api/interact'
import { useThemeStore } from '../stores/useThemeStore'
import type { SiteConfig } from '../types'

export default function SiteLayout() {
    // 站点名来自后端配置；后端还没配置时（data 为 null）用兜底名
    const { data: config } = useFetch<SiteConfig | null>('/site/config')
    const siteTitle = config?.siteTitle || '我的博客'

    const theme = useThemeStore((s) => s.theme)
    const toggle = useThemeStore((s) => s.toggle)

    // SPA 路由每次变化上报一次浏览（后台页面不在 SiteLayout 下，天然不会被统计）
    const { pathname } = useLocation()
    useEffect(() => {
        trackVisit(pathname)
    }, [pathname])

    return (
        <div className="flex min-h-screen flex-col bg-white text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            <header className="border-b border-gray-200 dark:border-gray-800">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-4">
                    <Link to="/" className="shrink-0 text-lg font-bold text-gray-900 dark:text-gray-100">
                        {siteTitle}
                    </Link>
                    <nav className="flex items-center gap-3 text-sm sm:gap-4">
                        <Link to="/archive" className="hover:text-gray-900 dark:hover:text-gray-100">归档</Link>
                        <Link to="/tags" className="hover:text-gray-900 dark:hover:text-gray-100">标签</Link>
                        <Link to="/search" className="hover:text-gray-900 dark:hover:text-gray-100">搜索</Link>
                        <Link to="/about" className="hover:text-gray-900 dark:hover:text-gray-100">关于</Link>
                        <button
                            type="button"
                            onClick={toggle}
                            className="shrink-0 rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 sm:px-3 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            {/* 手机上只留图标，文字占地方 */}
                            {theme === 'dark' ? '☀️' : '🌙'}
                            <span className="hidden sm:inline">{theme === 'dark' ? ' 浅色' : ' 深色'}</span>
                        </button>
                    </nav>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl flex-1 px-4">
                <Outlet />
            </main>

            <footer className="border-t border-gray-200 dark:border-gray-800">
                <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} {siteTitle}{config?.icp ? ` · ${config.icp}` : ''}</span>
                    <span className="flex gap-4">
                        {config?.githubUrl && (
                            <a href={config.githubUrl} target="_blank" rel="noreferrer" className="hover:text-gray-600 dark:hover:text-gray-200">
                                GitHub
                            </a>
                        )}
                        {/* RSS / sitemap 由后端输出，前端只放入口 */}
                        <a href="/v1/rss" target="_blank" rel="noreferrer" className="hover:text-gray-600 dark:hover:text-gray-200">RSS</a>
                        <a href="/v1/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-gray-600 dark:hover:text-gray-200">Sitemap</a>
                    </span>
                </div>
            </footer>
        </div>
    )
}
