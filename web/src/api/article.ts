// /v1/articles/* 相关接口
// GET 类请求由 useFetch 统一发起，这里只负责拼 URL；POST/PUT/DELETE 的封装后续阶段再加

export function articleListUrl(page: number, pageSize = 10) {
    return `/articles?page=${page}&pageSize=${pageSize}`
}

export function articleDetailUrl(slug: string) {
    return `/articles/${slug}`
}
