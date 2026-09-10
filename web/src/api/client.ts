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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`/v1${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...options.headers,
        },
    })
    const body: ApiResponse<T> = await res.json()
    if (body.code !== 0) {
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
}