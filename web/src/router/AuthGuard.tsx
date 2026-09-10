import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useIsLoggedIn } from '../stores/useAuthStore'

// 路由守卫：未登录访问 /admin/* 一律踢回登录页，并带上回跳地址（登录成功后跳回来）
// 一期只判"是否登录"；二期加角色时在这里扩展 props
export default function AuthGuard() {
    const isLoggedIn = useIsLoggedIn()
    const location = useLocation()

    if (!isLoggedIn) {
        const redirect = encodeURIComponent(location.pathname + location.search)
        return <Navigate to={`/login?redirect=${redirect}`} replace />
    }
    return <Outlet />
}
