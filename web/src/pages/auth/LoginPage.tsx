import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuthStore } from '../../stores/useAuthStore'
import { useTitle } from '../../hooks/useTitle'

export default function LoginPage() {
    useTitle('登录')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const loginSuccess = useAuthStore((s) => s.loginSuccess)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            const resp = await login(username, password)
            loginSuccess(resp.accessToken)
            // 优先跳回被守卫拦截前的目标页，否则进后台首页
            navigate(searchParams.get('redirect') || '/admin', { replace: true })
        } catch (err) {
            // 40101 登录失败：直接把后端的 message 显示出来
            setError(err instanceof ApiError ? err.message : '网络错误，请稍后再试')
        } finally {
            setSubmitting(false)
        }
    }

    const inputCls = 'w-full rounded border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700'

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <form onSubmit={submit} className="w-80 space-y-4 rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                <h1 className="text-center text-xl font-bold text-gray-900 dark:text-gray-100">管理员登录</h1>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="用户名"
                    required
                    autoComplete="username"
                    className={inputCls}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密码"
                    required
                    autoComplete="current-password"
                    className={inputCls}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-40"
                >
                    {submitting ? '登录中…' : '登录'}
                </button>
            </form>
        </div>
    )
}
