'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ComingSoonPage() {
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
    }
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-xs text-red-500 tracking-widest mb-4">MODULE</div>
        <h1 className="text-6xl font-black tracking-tighter mb-4">開発中</h1>
        <p className="text-slate-400 mb-8">この機能は現在準備中です</p>
        <a
          href="/"
          className="inline-block px-6 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black transition"
        >
          ← RETURN
        </a>
      </div>
    </main>
  )
}