'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!name || !gender || !password) {
      setMessage('すべて入力してください')
      return
    }

    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      setMessage('この名前はすでに使われています')
      return
    }

    const { error } = await supabase
      .from('members')
      .insert([{ name, gender, password }])

    if (error) {
      setMessage('登録に失敗しました: ' + error.message)
    } else {
      setMessage('登録完了。ログインページへ移動します')
      setTimeout(() => router.push('/login'), 1200)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-cyan-950 to-black text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />

      <div className="relative z-10 w-full max-w-md p-8 border border-cyan-900/60 bg-black/50 backdrop-blur-sm">
        <div className="text-xs text-cyan-500 tracking-widest mb-2">ENLIST</div>
        <h1 className="text-4xl font-black tracking-tighter mb-8">REGISTER</h1>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs tracking-wider text-cyan-400 mb-2">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-cyan-900 focus:border-cyan-400 focus:outline-none transition"
              placeholder="例: たろう"
            />
          </div>
          <div>
            <label className="block text-xs tracking-wider text-cyan-400 mb-2">GENDER</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-cyan-900 focus:border-cyan-400 focus:outline-none transition"
            >
              <option value="">選択してください</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
              <option value="未回答">未回答</option>
            </select>
          </div>
          <div>
            <label className="block text-xs tracking-wider text-cyan-400 mb-2">PASSWORD（ひらがな）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-cyan-900 focus:border-cyan-400 focus:outline-none transition"
            />
          </div>
          {message && <p className="text-center text-sm text-cyan-300">{message}</p>}
          <button
            type="submit"
            className="w-full py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-semibold tracking-wider transition"
          >
            REGISTER
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-400">
          すでに登録済みの方は{' '}
          <a href="/login" className="text-cyan-400 hover:underline">LOGIN</a>
        </p>
      </div>
    </main>
  )
}