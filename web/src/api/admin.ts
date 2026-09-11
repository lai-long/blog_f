import { client } from './client'

// /v1/admin/* 管理接口（全部需要登录，client 自动带 token）
// GET 由 useFetch 发起，这里拼 URL；写操作走 client

export interface ArticleSaveBody {
    title: string
    slug: string
    summary?: string
    content: string
    coverUrl?: string
    tags?: string[] // 标签名列表；不传=不动标签，[]=清空
    status: number // 0=草稿 1=发布 2=隐藏
}

export interface UploadResp {
    url: string
}

export function adminArticleListUrl(page: number, size = 10, status = -1) {
    return `/admin/articles?page=${page}&size=${size}&status=${status}`
}

export function createArticle(body: ArticleSaveBody) {
    return client.post<Record<string, never>>('/admin/articles', body)
}

export function updateArticle(id: number, body: ArticleSaveBody) {
    return client.put<Record<string, never>>(`/admin/articles/${id}`, body)
}

export function deleteArticle(id: number) {
    return client.delete<Record<string, never>>(`/admin/articles/${id}`)
}

export function uploadImage(file: File) {
    return client.upload<UploadResp>('/admin/upload', file)
}

export function adminCommentListUrl(page: number, size = 10, status = -1) {
    return `/admin/comments?page=${page}&size=${size}&status=${status}`
}

export function auditComment(id: number, status: number) {
    // status: 1=通过 2=垃圾
    return client.put<Record<string, never>>(`/admin/comments/${id}`, { status })
}

export function deleteComment(id: number) {
    return client.delete<Record<string, never>>(`/admin/comments/${id}`)
}

export function saveSiteConfig(body: { siteTitle?: string; icp?: string; githubUrl?: string }) {
    return client.put<Record<string, never>>('/admin/site/config', body)
}
