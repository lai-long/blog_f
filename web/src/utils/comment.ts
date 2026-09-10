import type { CommentItem } from '../types'

export interface CommentNode extends CommentItem {
    children: CommentNode[]
}

// 后端返回扁平列表，前端按 parentId 组树（parentId 缺省/0 为顶层）
export function buildCommentTree(list: CommentItem[]): CommentNode[] {
    const nodes = new Map<number, CommentNode>()
    const roots: CommentNode[] = []
    for (const c of list) nodes.set(c.id, { ...c, children: [] })
    for (const node of nodes.values()) {
        const parent = node.parentId ? nodes.get(node.parentId) : undefined
        if (parent) parent.children.push(node)
        else roots.push(node)
    }
    return roots
}
