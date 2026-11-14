'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MinigamesPage() {
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
    }
  }, [router])

  const games = [
    { href: '/minigame/target', title: '的あて', sub: '1分間の的あてチャレンジ' },
    { href: '/minigame/invader', title: 'インベーダー', sub: 'クラシックなインベーダーゲーム' },
    { href: '/minigame/tengame', title: 'TENGAME', sub: '合計10で消すパズル' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10 border-b border-red-900/50 pb-4">
          <div>
            <div className="text-xs text-red-500 tracking-widest">MINIGAMES</div>
            <h1 className="text-5xl font-black tracking-tighter">MINIGAME</h1>
          </div>
          <a href="/" className="text-red-400 hover:text-red-300 text-sm tracking-wider">← RETURN</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
          {games.map((game) => (
            <a
              key={game.href}
              href={game.href}
              className="group block p-6 border border-red-900/60 hover:border-red-400 bg-black/40 hover:bg-red-950/30 transition-all"
            >
              <div className="text-xs text-red-500 tracking-widest mb-2">GAME</div>
              <h2 className="text-2xl font-bold tracking-wider group-hover:text-red-400 transition">
                {game.title}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{game.sub}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}