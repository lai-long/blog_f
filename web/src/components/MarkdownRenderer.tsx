import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
// 只注册常用语言，避免全量 highlight.js（约 1MB）进首屏包
import hljs from 'highlight.js/lib/core'
import go from 'highlight.js/lib/languages/go'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import sql from 'highlight.js/lib/languages/sql'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
// 代码块固定用深色主题（亮色页面下深色代码块也是博客常见风格），避免深浅双主题的切换复杂度
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('go', go)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)

// react-markdown 默认禁用原始 HTML（防 XSS）；代码块用 highlight.js 高亮（其输出已转义，安全）
// rehype-slug 给每个标题加 id（github-slugger 算法），供目录（Toc）跳转
export default function MarkdownRenderer({ content }: { content: string }) {
    // 灯箱：被点击的图片 URL，非空即显示全屏预览
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

    // 灯箱打开时按 Esc 关闭
    useEffect(() => {
        if (!lightboxSrc) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxSrc(null)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [lightboxSrc])

    return (
        <div className="markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                    // loading="lazy" 让浏览器原生懒加载图片；点击进灯箱
                    img({ src, alt }) {
                        return (
                            <img
                                src={src}
                                alt={alt ?? ''}
                                loading="lazy"
                                onClick={() => typeof src === 'string' && setLightboxSrc(src)}
                                className="cursor-zoom-in"
                            />
                        )
                    },
                    code({ className, children }) {
                        const match = /language-(\w+)/.exec(className ?? '')
                        const text = String(children).replace(/\n$/, '')
                        if (match) {
                            try {
                                const html = hljs.highlight(text, { language: match[1] }).value
                                return (
                                    <code
                                        className={`hljs ${className ?? ''}`}
                                        dangerouslySetInnerHTML={{ __html: html }}
                                    />
                                )
                            } catch {
                                // 未知语言：不高亮，按纯文本渲染
                            }
                        }
                        return <code className={className}>{children}</code>
                    },
                }}
            >
                {content}
            </ReactMarkdown>

            {/* 灯箱：点遮罩或按 Esc 关闭 */}
            {lightboxSrc && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setLightboxSrc(null)}
                >
                    <img
                        src={lightboxSrc}
                        alt=""
                        className="max-h-[90vh] max-w-full cursor-zoom-out object-contain"
                    />
                </div>
            )}
        </div>
    )
}
