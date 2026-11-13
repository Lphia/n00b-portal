'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
    } else {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('n00b_user')
    router.push('/login')
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">LOADING...</div>
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />

      <header className="relative z-10 border-b border-red-900/50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-lg tracking-wide font-bold">
            USER: <span className="text-red-400 font-extrabold text-xl">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 text-xs border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition tracking-wider"
          >
            LOGOUT
          </button>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        <div className="mb-20">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-none">
            N00B
          </h1>
          <p className="mt-4 text-red-400 text-lg tracking-widest font-light">
            N00B COMMUNITY PORTAL
          </p>
        </div>

        <div className="max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
                { href: '/members', title: 'MEMBERS', sub: 'N00B一覧' },
                { href: '/coming-soon', title: 'LINKS', sub: 'リソース・ツール' },
                { href: '/coming-soon', title: 'NOTES', sub: '情報共有' },
                { href: '/coming-soon', title: 'GALLERY', sub: 'メディアアーカイブ' },
                { href: '/coming-soon', title: 'LINK', sub: 'リンク集' },
                { href: '/settings', title: 'SETTING', sub: 'プロフィール設定' },
              ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group block p-6 border border-red-900/60 hover:border-red-400 bg-black/40 hover:bg-red-950/30 transition-all duration-200"
              >
                <div className="text-xs text-red-500 tracking-widest mb-2">MODULE</div>
                <h2 className="text-2xl font-bold tracking-wider group-hover:text-red-400 transition">
                  {item.title}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{item.sub}</p>
              </a>
            ))}
          </div>

          {/* デイリーパスワード */}
          <div className="mt-16">
            <div className="text-xs text-red-500 tracking-widest mb-4">DAILY PASSWORDS</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { map: '零号ダム', code: '2258' },
                { map: 'ラヤリ渓谷', code: '8388' },
                { map: 'ブラケッシュ', code: '6979' },
                { map: 'スペースシティ', code: '9194' },
                { map: 'タイドプリズン', code: '2148' },
                { map: 'AZ3', code: '8025' },
              ].map((item) => (
                <div key={item.map} className="p-4 border border-red-900/60 bg-black/40 text-center">
                  <div className="text-xs text-red-500 mb-2">{item.map}</div>
                  <div className="text-3xl font-black text-red-400">{item.code}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-6 text-xs text-red-800 tracking-widest">
        N00B // CLASSIFIED
      </div>
    </main>
  )
}