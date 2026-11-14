'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TengameSelectPage() {
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
    }
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10 border-b border-red-900/50 pb-4">
          <div>
            <div className="text-xs text-red-500 tracking-widest">MINIGAME</div>
            <h1 className="text-5xl font-black tracking-tighter">TENGAME</h1>
          </div>
          <a href="/minigame" className="text-red-400 hover:text-red-300 text-sm tracking-wider">← MINIGAME</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <a
            href="/minigame/tengame/solo"
            className="block p-8 border border-red-900/60 bg-black/40 hover:border-red-400 transition text-center"
          >
            <div className="text-xs text-red-500 tracking-widest mb-2">MODE</div>
            <h2 className="text-3xl font-bold">ソロ</h2>
            <p className="text-slate-400 mt-2">2分間のハイスコア挑戦</p>
          </a>

          <div className="block p-8 border border-red-900/30 bg-black/20 text-center opacity-50">
            <div className="text-xs text-red-500 tracking-widest mb-2">MODE</div>
            <h2 className="text-3xl font-bold">対戦</h2>
            <p className="text-slate-400 mt-2">準備中</p>
          </div>
        </div>
      </div>
    </main>
  )
}