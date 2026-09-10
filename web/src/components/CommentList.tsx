import { buildCommentTree } from '../utils/comment'
import type { CommentNode } from '../utils/comment'
import type { CommentItem } from '../types'

interface CommentListProps {
    comments: CommentItem[]
    onReply: (parentId: number) => void
}

export default function CommentList({ comments, onReply }: CommentListProps) {
    const tree = buildCommentTree(comments)

    const renderNode = (node: CommentNode, depth: number) => (
        <li key={node.id} className={depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4 dark:border-gray-800' : ''}>
            <div className="py-3">
                <p className="text-sm">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{node.nickname}</span>
                    <span className="ml-2 text-gray-400">
                        {new Date(node.createdAt).toLocaleString('zh-CN')}
                    </span>
                </p>
                {/* React 渲染文本默认转义，评论内容不存在 XSS 风险 */}
                <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{node.content}</p>
                <button
                    type="button"
                    className="mt-1 text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => onReply(node.id)}
                >
                    回复
                </button>
            </div>
            {node.children.length > 0 && (
                <ul>{node.children.map((child) => renderNode(child, depth + 1))}</ul>
            )}
        </li>
    )

    return <ul className="divide-y divide-gray-100 dark:divide-gray-800">{tree.map((n) => renderNode(n, 0))}</ul>
}
