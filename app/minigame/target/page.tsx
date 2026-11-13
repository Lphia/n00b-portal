'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TargetPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [score, setScore] = useState(0)
  const [shots, setShots] = useState(0)
  const [targets, setTargets] = useState<{id: number, x: number, y: number}[]>([])
  const [finished, setFinished] = useState(false)
  const [todayRank, setTodayRank] = useState<any[]>([])
  const [allRank, setAllRank] = useState<any[]>([])
  const areaRef = useRef<HTMLDivElement>(null)
  const targetId = useRef(0)
  const scoreRef = useRef(0)
  const shotsRef = useRef(0)

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
      return
    }
    const u = JSON.parse(stored)
    setUser(u)
    fetchRankings()
  }, [router])

  const fetchRankings = async () => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: todayData } = await supabase
      .from('aim_scores')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .order('score', { ascending: false })
      .limit(10)

    const { data: allData } = await supabase
      .from('aim_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10)

    setTodayRank(todayData || [])
    setAllRank(allData || [])
  }

  useEffect(() => {
    scoreRef.current = score
    shotsRef.current = shots
  }, [score, shots])

  useEffect(() => {
    if (!started || finished) return

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          finishGame()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [started, finished])

  const spawnTarget = () => {
    const size = 32
    const x = Math.random() * (560 - size)
    const y = Math.random() * (560 - size)
    return { id: targetId.current++, x, y }
  }

  const startGame = () => {
    setScore(0)
    setShots(0)
    scoreRef.current = 0
    shotsRef.current = 0
    setTimeLeft(60)
    setFinished(false)
    setStarted(true)
    setTargets([spawnTarget()!, spawnTarget()!, spawnTarget()!])
  }

  const finishGame = async () => {
    setFinished(true)
    setStarted(false)

    const finalScore = scoreRef.current
    const finalShots = shotsRef.current

    if (!user || finalScore <= 0) return

    const accuracy = finalShots > 0 ? Number(((finalScore / finalShots) * 100).toFixed(1)) : 0

    const { error } = await supabase.from('aim_scores').insert({
      name: user.name,
      score: finalScore,
      accuracy,
    })

    if (error) {
      console.error('保存エラー:', error)
    } else {
      console.log('保存成功:', finalScore)
    }

    fetchRankings()
  }

  const handleAreaClick = () => {
    if (!started || finished) return
    setShots(s => s + 1)
  }

  const handleTargetClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!started || finished) return
    setScore(s => s + 1)
    setShots(s => s + 1)
    setTargets(prev => {
      const filtered = prev.filter(t => t.id !== id)
      return [...filtered, spawnTarget()!]
    })
  }

  const accuracy = shots > 0 ? ((score / shots) * 100).toFixed(1) : '0.0'

  if (!user) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-6 border-b border-red-900/50 pb-4">
          <div>
            <div className="text-xs text-red-500 tracking-widest">MINIGAME</div>
            <h1 className="text-5xl font-black tracking-tighter">的あて</h1>
          </div>
          <a href="/minigame" className="text-red-400 hover:text-red-300 text-sm tracking-wider">← MINIGAME</a>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!started && !finished && (
              <div className="text-center py-12">
                <p className="mb-6 text-slate-400">1分間、的を撃ち続けてください（常に3つ）</p>
                <button
                  onClick={startGame}
                  className="px-10 py-4 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black text-xl tracking-wider"
                >
                  START
                </button>
              </div>
            )}

            {started && (
              <div className="mb-4 flex justify-between text-lg max-w-[560px] mx-auto">
                <div>TIME: <span className="text-red-400 font-mono">{timeLeft}s</span></div>
                <div>SCORE: <span className="text-red-400 font-mono">{score}</span></div>
                <div>HIT: <span className="text-red-400 font-mono">{accuracy}%</span></div>
              </div>
            )}

            <div
              ref={areaRef}
              onClick={handleAreaClick}
              className="relative w-[560px] h-[560px] mx-auto border-2 border-red-900/70 bg-black/70 overflow-hidden"
            >
              {targets.map(t => (
                <div
                  key={t.id}
                  onClick={(e) => handleTargetClick(e, t.id)}
                  className="absolute w-8 h-8 rounded-full bg-red-600 border-2 border-red-400 cursor-pointer"
                  style={{ left: t.x, top: t.y }}
                />
              ))}
            </div>

            {finished && (
              <div className="mt-8 text-center">
                <h2 className="text-3xl font-black mb-4">RESULT</h2>
                <div className="text-2xl mb-2">SCORE: <span className="text-red-400">{score}</span></div>
                <div className="text-xl mb-6">HIT RATE: <span className="text-red-400">{accuracy}%</span></div>
                <button
                  onClick={startGame}
                  className="px-8 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black"
                >
                  RETRY
                </button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-red-400 mb-3 tracking-wider">TODAY</h2>
              <div className="space-y-2">
                {todayRank.map((r, i) => (
                  <div key={r.id} className="flex justify-between text-sm p-2 border border-red-900/40 bg-black/30">
                    <span>{i + 1}. {r.name}</span>
                    <span>{r.score} <span className="text-red-400">({r.accuracy}%)</span></span>
                  </div>
                ))}
                {todayRank.length === 0 && <p className="text-slate-500 text-sm">まだ記録なし</p>}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-400 mb-3 tracking-wider">ALL TIME</h2>
              <div className="space-y-2">
                {allRank.map((r, i) => (
                  <div key={r.id} className="flex justify-between text-sm p-2 border border-red-900/40 bg-black/30">
                    <span>{i + 1}. {r.name}</span>
                    <span>{r.score} <span className="text-red-400">({r.accuracy}%)</span></span>
                  </div>
                ))}
                {allRank.length === 0 && <p className="text-slate-500 text-sm">まだ記録なし</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}