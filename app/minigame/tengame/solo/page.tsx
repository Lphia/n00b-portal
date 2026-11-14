'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ROWS = 10
const COLS = 17

const themes = [
  { bg: 'bg-red-900/70', selected: 'bg-red-600', apple: 'text-white' },
  { bg: 'bg-green-900/70', selected: 'bg-green-600', apple: 'text-white' },
  { bg: 'bg-blue-900/70', selected: 'bg-blue-600', apple: 'text-white' },
  { bg: 'bg-purple-900/70', selected: 'bg-purple-600', apple: 'text-white' },
]

export default function TengameSoloPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [theme, setTheme] = useState(0)
  const [grid, setGrid] = useState<number[][]>([])
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [todayRank, setTodayRank] = useState<any[]>([])
  const [allRank, setAllRank] = useState<any[]>([])
  const [selecting, setSelecting] = useState(false)
  const [startCell, setStartCell] = useState<{r: number, c: number} | null>(null)
  const [endCell, setEndCell] = useState<{r: number, c: number} | null>(null)
  const scoreRef = useRef(0)

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(stored))
    fetchRankings()
    generateBoard()
  }, [router])

  const generateBoard = () => {
    const newGrid = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => Math.floor(Math.random() * 9) + 1)
    )
    setGrid(newGrid)
  }

  const fetchRankings = async () => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { data: todayData } = await supabase
      .from('tengame_scores')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .order('score', { ascending: false })
      .limit(10)
    const { data: allData } = await supabase
      .from('tengame_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10)
    setTodayRank(todayData || [])
    setAllRank(allData || [])
  }

  useEffect(() => {
    scoreRef.current = score
  }, [score])

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

  const startGame = () => {
    generateBoard()
    setScore(0)
    scoreRef.current = 0
    setTimeLeft(120)
    setFinished(false)
    setStarted(true)
  }

  const finishGame = async () => {
    setFinished(true)
    setStarted(false)
    if (user && scoreRef.current > 0) {
      await supabase.from('tengame_scores').insert({
        name: user.name,
        score: scoreRef.current,
      })
      fetchRankings()
    }
  }

  const getSelectedCells = () => {
    if (!startCell || !endCell) return []
    const r1 = Math.min(startCell.r, endCell.r)
    const r2 = Math.max(startCell.r, endCell.r)
    const c1 = Math.min(startCell.c, endCell.c)
    const c2 = Math.max(startCell.c, endCell.c)
    const cells: {r: number, c: number}[] = []
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (grid[r]?.[c]) cells.push({ r, c })
      }
    }
    return cells
  }

  const checkAndClear = () => {
    const cells = getSelectedCells()
    if (cells.length === 0) return
    const sum = cells.reduce((s, { r, c }) => s + (grid[r][c] || 0), 0)
    if (sum === 10) {
      const newGrid = grid.map(row => [...row])
      cells.forEach(({ r, c }) => {
        newGrid[r][c] = 0
      })
      setGrid(newGrid)
      setScore(s => s + cells.length)
    }
    setStartCell(null)
    setEndCell(null)
    setSelecting(false)
  }

  const handleMouseDown = (r: number, c: number) => {
    if (!started || !grid[r][c]) return
    setSelecting(true)
    setStartCell({ r, c })
    setEndCell({ r, c })
  }

  const handleMouseEnter = (r: number, c: number) => {
    if (selecting) setEndCell({ r, c })
  }

  const handleMouseUp = () => {
    if (selecting) checkAndClear()
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-6 border-b border-red-900/50 pb-4">
          <div>
            <div className="text-xs text-red-500 tracking-widest">TENGAME</div>
            <h1 className="text-5xl font-black tracking-tighter">ソロ</h1>
          </div>
          <a href="/minigame/tengame" className="text-red-400 hover:text-red-300 text-sm tracking-wider">← MODE</a>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!started && !finished && (
              <div className="text-center py-12">
                <p className="mb-4 text-slate-400">数字をドラッグして合計10で消す</p>
                <p className="mb-6 text-sm text-red-400">制限時間 2分</p>
                <button
                  onClick={startGame}
                  className="px-10 py-4 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black text-xl"
                >
                  START
                </button>
              </div>
            )}

            {started && (
              <div className="mb-4 flex justify-between items-center text-lg max-w-3xl mx-auto">
                <div>TIME: <span className="text-red-400 font-mono">{timeLeft}s</span></div>
                <div>SCORE: <span className="text-red-400 font-mono">{score}</span></div>
                <button
                  onClick={() => setTheme((theme + 1) % themes.length)}
                  className="px-4 py-1.5 text-xs border border-red-500 text-red-400 hover:bg-red-500 hover:text-black"
                >
                  COLOR
                </button>
              </div>
            )}

            <div
              className="mx-auto select-none"
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ display: started || finished ? 'block' : 'none' }}
            >
              <div className="inline-grid gap-1 bg-black/50 p-2 border border-red-900/50"
                style={{ gridTemplateColumns: `repeat(${COLS}, 32px)` }}
              >
                {grid.map((row, r) =>
                  row.map((num, c) => {
                    const selected = getSelectedCells().some(cell => cell.r === r && cell.c === c)
                    return (
                      <div
                        key={`${r}-${c}`}
                        onMouseDown={() => handleMouseDown(r, c)}
                        onMouseEnter={() => handleMouseEnter(r, c)}
                        className={`w-8 h-8 flex items-center justify-center text-sm font-bold cursor-pointer rounded-full
                          ${num === 0 ? 'bg-transparent' : selected ? themes[theme].selected : themes[theme].bg}
                          ${themes[theme].apple}
                        `}
                      >
                        {num || ''}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {finished && (
              <div className="mt-8 text-center">
                <h2 className="text-3xl font-black mb-4">RESULT</h2>
                <div className="text-2xl mb-6">SCORE: <span className="text-red-400">{score}</span></div>
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
              <h2 className="text-xl font-bold text-red-400 mb-3">TODAY</h2>
              {todayRank.map((r, i) => (
                <div key={r.id} className="flex justify-between text-sm p-2 border border-red-900/40 bg-black/30 mb-1">
                  <span>{i + 1}. {r.name}</span>
                  <span className="text-red-400">{r.score}</span>
                </div>
              ))}
              {todayRank.length === 0 && <p className="text-slate-500 text-sm">まだ記録なし</p>}
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-400 mb-3">ALL TIME</h2>
              {allRank.map((r, i) => (
                <div key={r.id} className="flex justify-between text-sm p-2 border border-red-900/40 bg-black/30 mb-1">
                  <span>{i + 1}. {r.name}</span>
                  <span className="text-red-400">{r.score}</span>
                </div>
              ))}
              {allRank.length === 0 && <p className="text-slate-500 text-sm">まだ記録なし</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}