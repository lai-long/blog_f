import { Routes, Route } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import HomePage from '../pages/site/HomePage'
import ArticlePage from '../pages/site/ArticlePage'
import ArchivePage from '../pages/site/ArchivePage'
import SearchPage from '../pages/site/SearchPage'
import AboutPage from '../pages/site/AboutPage'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/admin/DashboardPage'
import AdminArticlesPage from '../pages/admin/AdminArticlesPage'
import WritePage from '../pages/admin/WritePage'
import AdminCommentsPage from '../pages/admin/AdminCommentsPage'
import AdminSettingsPage from '../pages/admin/AdminSettingsPage'

export default function AppRoutes(){
    return (
        <Routes>
            {/* 前台：5 个页面共享 SiteLayout（顶栏+页脚），页面内容渲染在 <Outlet /> 处 */}
            <Route element={<SiteLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/articles/:slug" element={<ArticlePage />} />
                <Route path="/archive" element={<ArchivePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/about" element={<AboutPage />} />
            </Route>

            {/* 登录 */}
            <Route path="/login" element={<LoginPage />} />

            {/* 后台 */}
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/articles" element={<AdminArticlesPage />} />
            <Route path="/admin/write" element={<WritePage />} />
            <Route path="/admin/write/:slug" element={<WritePage />} />
            <Route path="/admin/comments" element={<AdminCommentsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Routes>
    )
}