import type { ApiResponse } from '../types'

// token 只存内存（不落 localStorage），刷新页面即丢失——一期的已知取舍
let accessToken = ''

export function setToken(token: string) {
    accessToken = token
}

export class ApiError extends Error {
    code: number

    constructor(code: number, message: string) {
        super(message)
        this.code = code
    }
}

async function request<T>(path: string, options: RequestInit = {}, json = true): Promise<T> {
    const headers: Record<string, string> = {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers as Record<string, string> | undefined),
    }
    const res = await fetch(`/v1${path}`, { ...options, headers })
    const body: ApiResponse<T> = await res.json()
    if (body.code !== 0) {
        if (body.code === 40103) {
            // token 无效/过期：清空登录态并跳登录页，带上回跳地址
            // 整页跳转同时会清空内存中的 zustand 登录态（token 本就只存内存）
            accessToken = ''
            const redirect = encodeURIComponent(location.pathname + location.search)
            location.href = `/login?redirect=${redirect}`
        }
        throw new ApiError(body.code, body.message)
    }
    return body.data
}

export const client = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, data: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
    put: <T>(path: string, data: unknown) =>
        request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    // 文件上传走 multipart/form-data；Content-Type 由浏览器自动带 boundary，不能手设
    upload: <T>(path: string, file: File) => {
        const form = new FormData()
        form.append('file', file)
        return request<T>(path, { method: 'POST', body: form }, false)
    },
}
