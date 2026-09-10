import { client } from './client'

// /v1/articles/:slug/comments 评论接口
// GET 由 useFetch 发起，这里只拼 URL；发表是 POST，走 client

export function commentListUrl(slug: string) {
    return `/articles/${slug}/comments`
}

export interface CommentSaveBody {
    nickname?: string
    content: string
    parentId?: number
}

export function createComment(slug: string, body: CommentSaveBody) {
    return client.post<Record<string, never>>(`/articles/${slug}/comments`, body)
}
