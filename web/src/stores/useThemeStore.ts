import { create } from 'zustand'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
    // 之前手动选过 → 用记住的选择；没选过 → 跟随操作系统
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

function applyTheme(theme: Theme) {
    // 给 <html> 加/删 dark class，Tailwind 的 dark: 样式据此生效
    document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeStore {
    theme: Theme
    toggle: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => {
    const initial = getInitialTheme()
    applyTheme(initial)
    return {
        theme: initial,
        toggle: () => {
            const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
            localStorage.setItem('theme', next) // 记住选择，刷新后保持
            applyTheme(next)
            set({ theme: next })
        },
    }
})
