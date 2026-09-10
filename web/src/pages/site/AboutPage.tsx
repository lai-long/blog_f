import { useFetch } from '../../hooks/useFetch'
import { useTitle } from '../../hooks/useTitle'
import type { SiteConfig } from '../../types'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'

export default function AboutPage() {
    useTitle('关于')
    // 关于页内容来自后端 site config；未配置时（data 为 null）显示默认文案
    const { data: config, loading, error, reload } = useFetch<SiteConfig | null>('/site/config')

    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />

    return (
        <div className="mx-auto max-w-[720px] py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">关于</h1>
            <div className="mt-6 space-y-4 leading-[1.8] text-gray-700 dark:text-gray-300">
                <p>
                    欢迎来到 <strong>{config?.siteTitle || '我的博客'}</strong>。
                    这里记录我的学习笔记与技术思考。
                </p>
                {config?.githubUrl && (
                    <p>
                        GitHub：
                        <a
                            href={config.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline underline-offset-4 dark:text-blue-400"
                        >
                            {config.githubUrl}
                        </a>
                    </p>
                )}
                {config?.icp && <p className="text-sm text-gray-400">{config.icp}</p>}
            </div>
        </div>
    )
}
