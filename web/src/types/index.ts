export interface ApiResponse<T> {
    code: number
    message: string
    data: T
}

export interface ArticleSummary {
    id: number
    title: string
    slug: string
    summary?: string
    coverUrl?: string
    views: number
    publishedAt: string
}

export interface ArticleDetail {
    id: number
    title: string
    slug: string
    content: string
    coverUrl?: string
    views: number
    publishedAt: string
}

export interface ArticleListResp {
    list: ArticleSummary[]
    total: number
}

export interface LoginResp {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

export interface ProfileResp {
    username: string
    nickname: string
    avatarUrl?: string
}

export interface CommentItem {
    id: number
    parentId?: number
    nickname: string
    avatarUrl?: string
    content: string
    createdAt: string
}

export interface CommentListResp {
    list: CommentItem[]
    total: number
}

export interface SiteConfig {
    siteTitle: string
    icp?: string
    githubUrl?: string
}