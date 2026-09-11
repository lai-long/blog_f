import { Link, Outlet } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { useThemeStore } from '../stores/useThemeStore'
import type { SiteConfig } from '../types'

export default function SiteLayout() {
    // 站点名来自后端配置；后端还没配置时（data 为 null）用兜底名
    const { data: config } = useFetch<SiteConfig | null>('/site/config')
    const siteTitle = config?.siteTitle || '我的博客'

    const theme = useThemeStore((s) => s.theme)
    const toggle = useThemeStore((s) => s.toggle)

    return (
        <div className="flex min-h-screen flex-col bg-white text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            <header className="border-b border-gray-200 dark:border-gray-800">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                    <Link to="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {siteTitle}
                    </Link>
                    <nav className="flex items-center gap-4 text-sm">
                        <Link to="/archive" className="hover:text-gray-900 dark:hover:text-gray-100">归档</Link>
                        <Link to="/tags" className="hover:text-gray-900 dark:hover:text-gray-100">标签</Link>
                        <Link to="/search" className="hover:text-gray-900 dark:hover:text-gray-100">搜索</Link>
                        <Link to="/about" className="hover:text-gray-900 dark:hover:text-gray-100">关于</Link>
                        <button
                            type="button"
                            onClick={toggle}
                            className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            {theme === 'dark' ? '☀️ 浅色' : '🌙 深色'}
                        </button>
                    </nav>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl flex-1 px-4">
                <Outlet />
            </main>

            <footer className="border-t border-gray-200 dark:border-gray-800">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-sm text-gray-400">
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
