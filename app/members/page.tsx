'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
      return
    }

    const fetchMembers = async () => {
      const { data } = await supabase
        .from('members')
        .select('id, name, created_at, avatar_url')
        .order('created_at', { ascending: true })

      if (data) setMembers(data)
      setLoading(false)
    }

    fetchMembers()
  }, [router])

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">LOADING...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10 border-b border-red-900/50 pb-4">
          <div>
            <div className="text-xs text-red-500 tracking-widest">PERSONNEL</div>
            <h1 className="text-5xl font-black tracking-tighter">MEMBERS</h1>
          </div>
          <a href="/" className="text-red-400 hover:text-red-300 text-sm tracking-wider">
            ← RETURN
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((member) => (
            <a
              key={member.id}
              href={`/members/${member.id}`}
              className="p-5 border border-red-900/60 bg-black/40 flex items-center gap-4 hover:border-red-500 transition"
            >
              {member.avatar_url ? (
                <img src={member.avatar_url} className="w-12 h-12 object-cover border border-red-900" />
              ) : (
                <div className="w-12 h-12 bg-red-950/50 border border-red-900 flex items-center justify-center text-xs">N/A</div>
              )}
              <div>
                <div className="text-xl font-mono font-semibold">{member.name}</div>
                <div className="text-slate-500 text-xs mt-1">
                  ENLISTED: {new Date(member.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </a>
          ))}
        </div>

        {members.length === 0 && (
          <p className="text-center text-slate-400 mt-10">まだメンバーがいません</p>
        )}
      </div>
    </main>
  )
}