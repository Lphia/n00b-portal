'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('name', name)
      .eq('password', password)
      .single()

    if (error || !data) {
      setMessage('名前またはパスワードが違います')
    } else {
      localStorage.setItem('n00b_user', JSON.stringify(data))
      setMessage('ログイン成功')
      setTimeout(() => router.push('/'), 800)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />

      <div className="relative z-10 w-full max-w-md p-8 border border-red-900/60 bg-black/50 backdrop-blur-sm">
        <div className="text-xs text-red-500 tracking-widest mb-2">ACCESS</div>
        <h1 className="text-4xl font-black tracking-tighter mb-8">LOGIN</h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs tracking-wider text-red-400 mb-2">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-red-900 focus:border-red-400 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs tracking-wider text-red-400 mb-2">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-red-900 focus:border-red-400 focus:outline-none transition"
            />
          </div>
          {message && <p className="text-center text-sm text-red-300">{message}</p>}
          <button
            type="submit"
            className="w-full py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black font-semibold tracking-wider transition"
          >
            ENTER
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-400">
          未登録の方は{' '}
          <a href="/register" className="text-red-400 hover:underline">REGISTER</a>
        </p>
      </div>
    </main>
  )
}