import GithubSlugger from 'github-slugger'

export interface TocItem {
    level: number // 1~3，对应 h1~h3
    text: string
    id: string // 与 rehype-slug 生成的标题 id 一致（同一套 slug 算法）
}

// 从 Markdown 源码提取标题；代码块（``` 围栏）里的 # 行不算标题
export function extractToc(content: string): TocItem[] {
    const slugger = new GithubSlugger()
    const items: TocItem[] = []
    let inCodeBlock = false
    for (const line of content.split('\n')) {
        if (line.trimStart().startsWith('```')) {
            inCodeBlock = !inCodeBlock
            continue
        }
        if (inCodeBlock) continue
        const match = /^(#{1,3})\s+(.+)$/.exec(line)
        if (match) {
            const text = match[2].trim()
            items.push({ level: match[1].length, text, id: slugger.slug(text) })
        }
    }
    return items
}
