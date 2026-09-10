import { create } from 'zustand'
import { setToken } from '../api/client'

interface AuthStore {
    // accessToken 只存内存，不落 localStorage：刷新页面即回到游客态（一期的已知取舍）
    token: string
    loginSuccess: (token: string) => void
    clear: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    token: '',
    loginSuccess: (token) => {
        setToken(token) // 同步给 client.ts，之后所有请求自动带 Authorization
        set({ token })
    },
    clear: () => {
        setToken('')
        set({ token: '' })
    },
}))

export function useIsLoggedIn() {
    return useAuthStore((s) => s.token !== '')
}
