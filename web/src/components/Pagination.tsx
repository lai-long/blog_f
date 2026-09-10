interface PaginationProps {
    page: number
    total: number
    pageSize: number
    onChange: (page: number) => void
}

export default function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
    const pageCount = Math.ceil(total / pageSize)
    if (pageCount <= 1) return null

    const btn = 'rounded border border-gray-300 px-3 py-1 text-sm enabled:hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:enabled:hover:bg-gray-800'

    return (
        <div className="flex items-center justify-center gap-4 py-8">
            <button type="button" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
                上一页
            </button>
            <span className="text-sm text-gray-400">
                第 {page} / {pageCount} 页
            </span>
            <button type="button" className={btn} disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
                下一页
            </button>
        </div>
    )
}
