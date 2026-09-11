import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveSiteConfig } from '../../api/admin'
import { changePassword } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import { useAuthStore } from '../../stores/useAuthStore'
import type { SiteConfig } from '../../types'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'

const inputCls = 'w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900'

export default function AdminSettingsPage() {
    useTitle('站点设置')
    const navigate = useNavigate()
    const clear = useAuthStore((s) => s.clear)

    const { data: config, loading, error, reload } = useFetch<SiteConfig>('/site/config')

    // 站点设置表单：数据回来后用 key 重置受控组件来初始化（见下方 form key）
    const [siteMsg, setSiteMsg] = useState('')
    const [pwdMsg, setPwdMsg] = useState('')
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPwd, setShowPwd] = useState(false) // true=明文显示

    const saveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        setSiteMsg('')
        try {
            await saveSiteConfig({
                siteTitle: String(form.get('siteTitle') ?? ''),
                icp: String(form.get('icp') ?? ''),
                githubUrl: String(form.get('githubUrl') ?? ''),
            })
            setSiteMsg('保存成功，前台刷新生效')
            reload()
        } catch (err) {
            setSiteMsg(err instanceof ApiError ? err.message : '保存失败')
        }
    }

    const submitPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPwdMsg('')
        if (newPassword !== confirmPassword) {
            setPwdMsg('两次输入的新密码不一致')
            return
        }
        try {
            await changePassword(oldPassword, newPassword)
            // 改密后旧 token 失效：清空登录态，重新登录
            clear()
            navigate('/login', { replace: true })
        } catch (err) {
            setPwdMsg(err instanceof ApiError ? err.message : '修改失败')
        }
    }

    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />

    return (
        <div className="max-w-xl">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">站点设置</h1>

            {/* key 变化会重建表单，让 initialValue 生效（配置从接口异步回来） */}
            <form key={JSON.stringify(config)} onSubmit={saveConfig} className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <label className="block text-sm">
                    站点标题
                    <input name="siteTitle" defaultValue={config?.siteTitle ?? ''} className={`${inputCls} mt-1`} />
                </label>
                <label className="block text-sm">
                    GitHub 链接
                    <input name="githubUrl" defaultValue={config?.githubUrl ?? ''} className={`${inputCls} mt-1`} />
                </label>
                <label className="block text-sm">
                    备案号
                    <input name="icp" defaultValue={config?.icp ?? ''} className={`${inputCls} mt-1`} />
                </label>
                <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700">
                    保存
                </button>
                {siteMsg && <p className="text-sm text-gray-500 dark:text-gray-400">{siteMsg}</p>}
            </form>

            <h2 className="mt-8 font-bold text-gray-900 dark:text-gray-100">修改密码</h2>
            <form onSubmit={submitPassword} className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <label className="block text-sm">
                    旧密码
                    <input type={showPwd ? 'text' : 'password'} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required autoComplete="current-password" className={`${inputCls} mt-1`} />
                </label>
                <label className="block text-sm">
                    新密码
                    <input type={showPwd ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} autoComplete="new-password" className={`${inputCls} mt-1`} />
                </label>
                <label className="block text-sm">
                    确认新密码
                    <input
                        type={showPwd ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className={`${inputCls} mt-1 ${confirmPassword && confirmPassword !== newPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                </label>
                {/* type="button" 必须写，否则在 form 里默认是提交按钮 */}
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPwd ? '🙈 隐藏密码' : '👁 显示密码'}
                </button>
                <div>
                    <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700">
                        修改密码
                    </button>
                </div>
                <p className="text-xs text-gray-400">修改成功后需要重新登录</p>
                {pwdMsg && <p className="text-sm text-red-500">{pwdMsg}</p>}
            </form>
        </div>
    )
}
