export interface ApiResponse<T> {
    code: number
    message: string
    data: T
}

export interface TagVo {
    name: string
    slug: string
}

export interface TagWithCount {
    name: string
    slug: string
    count: number
}

export interface TagListResp {
    list: TagWithCount[]
}

export interface ArticleSummary {
    id: number
    title: string
    slug: string
    summary?: string
    coverUrl?: string
    views: number
    publishedAt: string
    tags: TagVo[]
}

export interface ArticleDetail {
    id: number
    title: string
    slug: string
    summary?: string
    content: string
    coverUrl?: string
    views: number
    publishedAt: string
    tags: TagVo[]
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

export interface AdminArticleSummary {
    id: number
    title: string
    slug: string
    status: number // 0=草稿 1=发布 2=隐藏
    views: number
    publishedAt: string
    updatedAt: string
}

export interface AdminArticleListResp {
    list: AdminArticleSummary[]
    total: number
}

export interface AdminComment {
    id: number
    articleId: number
    articleTitle: string
    articleSlug: string
    parentId: number
    nickname: string
    content: string
    status: number // 0=待审核 1=通过 2=垃圾
    createdAt: string
}

export interface AdminCommentListResp {
    list: AdminComment[]
    total: number
}