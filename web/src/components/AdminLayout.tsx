import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'
import { useAuthStore } from '../stores/useAuthStore'

const navItems = [
    { to: '/admin', label: '仪表盘', end: true },
    { to: '/admin/articles', label: '文章管理', end: false },
    { to: '/admin/write', label: '写文章', end: false },
    { to: '/admin/comments', label: '评论管理', end: false },
    { to: '/admin/settings', label: '站点设置', end: false },
]

// 后台布局：左侧导航 + 右侧内容；已在外层被 AuthGuard 保护
export default function AdminLayout() {
    const navigate = useNavigate()
    const clear = useAuthStore((s) => s.clear)

    const handleLogout = async () => {
        try {
            await logout()
        } catch {
            // 登出接口失败也照常清空本地登录态
        }
        clear()
        navigate('/login', { replace: true })
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            <aside className="flex w-48 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <Link to="/" className="border-b border-gray-200 px-4 py-4 font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
                    博客后台
                </Link>
                <nav className="flex-1 p-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `block rounded px-3 py-2 text-sm ${
                                    isActive
                                        ? 'bg-blue-50 font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="border-t border-gray-200 px-4 py-3 text-left text-sm text-gray-400 hover:text-red-500 dark:border-gray-800"
                >
                    退出登录
                </button>
            </aside>
            <main className="flex-1 overflow-x-auto p-6">
                <Outlet />
            </main>
        </div>
    )
}
