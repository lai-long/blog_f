export default function ErrorState({
                                       message,
                                       onRetry,
                                   }: {
    message: string
    onRetry?: () => void
}) {
    return (
        <div className="p-8 text-center">
            <p className="text-red-500">{message}</p>
            {onRetry && (
                <button
                    className="mt-4 rounded border px-4 py-1 hover:bg-gray-100"
                    onClick={onRetry}
                >
                    重试
                </button>
            )}
        </div>
    )
}