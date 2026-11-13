'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LinksPage() {
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
    }
  }, [router])

  const links = [
    {
      title: 'DELTA FORCE 公式サイト',
      url: 'https://www.playdeltaforce.com/ja/',
      desc: '公式ホームページ',
    },
    {
      title: 'マップWiki',
      url: 'https://www.playdeltaforce.com/act/mapswiki/?lang=ja',
      desc: 'マップ情報・攻略',
    },
    {
      title: 'DELTA FORCE 本部',
      url: 'https://www.playdeltaforce.com/events/hq/ja/',
      desc: 'データ確認',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10 border-b border-red-900/50 pb-4">
          <div>
            <div className="text-xs text-red-500 tracking-widest">RESOURCES</div>
            <h1 className="text-5xl font-black tracking-tighter">LINKS</h1>
          </div>
          <a href="/" className="text-red-400 hover:text-red-300 text-sm tracking-wider">
            ← RETURN
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 border border-red-900/60 bg-black/40 hover:border-red-500 transition"
            >
              <div className="text-xl font-semibold">{link.title}</div>
              <div className="text-slate-400 text-sm mt-1">{link.desc}</div>
              <div className="text-xs text-red-400 mt-3">外部リンク →</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}