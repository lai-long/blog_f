import { useEffect } from 'react'
import { client } from '../../api/client'
import type { SiteConfig } from '../../types'

export default function HomePage() {
    useEffect(() => {
        client
            .get<SiteConfig>('/site/config')
            .then((data) => console.log('拿到站点配置：', data))
            .catch((err) => console.error('请求失败：', err))
    }, [])

    return <h1 className="text-2xl font-bold p-8">首页</h1>
}
