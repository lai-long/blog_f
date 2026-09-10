export default function Empty({ text = '暂无数据' }: { text?: string }) {
    return <div className="p-8 text-center text-gray-400">{text}</div>
}