import { client } from './client'
import type { LoginResp, ProfileResp } from '../types'

// /v1/auth/* 认证接口

export function login(username: string, password: string) {
    return client.post<LoginResp>('/auth/login', { username, password })
}

export function logout() {
    return client.post<Record<string, never>>('/auth/logout', {})
}

export function getProfile() {
    return client.get<ProfileResp>('/admin/profile')
}

export function saveProfile(body: { nickname?: string; avatarUrl?: string }) {
    return client.put<Record<string, never>>('/admin/profile', body)
}

export function changePassword(oldPassword: string, newPassword: string) {
    return client.put<Record<string, never>>('/admin/password', { oldPassword, newPassword })
}
