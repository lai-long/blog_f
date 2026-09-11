import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import Loading from '../components/Loading'
import AuthGuard from './AuthGuard'
import HomePage from '../pages/site/HomePage'
import ArticlePage from '../pages/site/ArticlePage'
import ArchivePage from '../pages/site/ArchivePage'
import TagsPage from '../pages/site/TagsPage'
import TagArticlesPage from '../pages/site/TagArticlesPage'
import SearchPage from '../pages/site/SearchPage'
import AboutPage from '../pages/site/AboutPage'
import LoginPage from '../pages/auth/LoginPage'

// 后台全部懒加载：游客不下载后台代码包（D1）
const AdminLayout = lazy(() => import('../components/AdminLayout'))
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'))
const AdminArticlesPage = lazy(() => import('../pages/admin/AdminArticlesPage'))
const WritePage = lazy(() => import('../pages/admin/WritePage'))
const AdminCommentsPage = lazy(() => import('../pages/admin/AdminCommentsPage'))
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'))

export default function AppRoutes(){
    return (
        <Routes>
            {/* 前台：5 个页面共享 SiteLayout（顶栏+页脚），页面内容渲染在 <Outlet /> 处 */}
            <Route element={<SiteLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/articles/:slug" element={<ArticlePage />} />
                <Route path="/archive" element={<ArchivePage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/tags/:slug" element={<TagArticlesPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/about" element={<AboutPage />} />
            </Route>

            {/* 登录 */}
            <Route path="/login" element={<LoginPage />} />

            {/* 后台：AuthGuard 做登录拦截，AdminLayout 提供侧边导航；整段懒加载 */}
            <Route element={<AuthGuard />}>
                <Route element={<Suspense fallback={<Loading />}><AdminLayout /></Suspense>}>
                    <Route path="/admin" element={<DashboardPage />} />
                    <Route path="/admin/articles" element={<AdminArticlesPage />} />
                    <Route path="/admin/write" element={<WritePage />} />
                    <Route path="/admin/write/:slug" element={<WritePage />} />
                    <Route path="/admin/comments" element={<AdminCommentsPage />} />
                    <Route path="/admin/settings" element={<AdminSettingsPage />} />
                </Route>
            </Route>
        </Routes>
    )
}
