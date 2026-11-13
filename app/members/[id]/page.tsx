'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function MemberDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
      return
    }

    const fetchMember = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setLoading(false)
        return
      }
      setMember(data)
      setLoading(false)
    }

    fetchMember()
  }, [id, router])

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">LOADING...</div>
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p>メンバーが見つかりません</p>
          <a href="/members" className="text-red-400 mt-4 inline-block">← 戻る</a>
        </div>
      </div>
    )
  }

  const gearEntries = member.gear ? Object.entries(member.gear).filter(([_, v]: any) => v?.name) : []
  const games = member.game_settings || []

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white">
      <div className="container mx-auto px-6 py-10">
        <a href="/members" className="text-red-400 text-sm tracking-wider">← MEMBERS</a>

        {/* プロフィール */}
        <div className="mt-8 flex items-center gap-6 border-b border-red-900/50 pb-8">
          {member.avatar_url ? (
            <img src={member.avatar_url} className="w-28 h-28 object-cover border border-red-900" />
          ) : (
            <div className="w-28 h-28 bg-red-950/50 border border-red-900 flex items-center justify-center text-xs">NO ICON</div>
          )}
          <div>
            <h1 className="text-5xl font-black tracking-tighter">{member.name}</h1>
            <p className="text-red-400 mt-1">{member.gender || '未設定'}</p>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-12">
          {/* MY GEAR */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-red-400 tracking-wider">MY GEAR</h2>
            {gearEntries.length === 0 ? (
              <p className="text-slate-500">未設定</p>
            ) : (
              <div className="space-y-4">
                {gearEntries.map(([category, item]: any) => (
                  <div key={category} className="flex items-center gap-4 p-3 border border-red-900/40 bg-black/30">
                    {item.image && (
                      <img src={item.image} className="w-16 h-16 object-contain bg-white" />
                    )}
                    <div className="flex-1">
                      <div className="text-xs text-red-500">{category}</div>
                      <div className="text-sm">{item.name}</div>
                      {item.url && (
                        <a href={item.url} target="_blank" className="text-xs text-red-400 hover:underline">Amazon</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GAME SETTINGS */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-red-400 tracking-wider">GAME SETTINGS</h2>
            {games.length === 0 ? (
              <p className="text-slate-500">未設定</p>
            ) : (
              <div className="space-y-4">
                {games.map((g: any, i: number) => (
                  <div key={i} className="p-4 border border-red-900/40 bg-black/30">
                    <div className="font-semibold">{g.game || '無名'}</div>
                    <div className="text-sm text-slate-400 mt-1">
                      DPI: {g.dpi || '-'}　/　感度: {g.sens || '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}