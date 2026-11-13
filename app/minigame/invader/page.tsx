'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function InvaderPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [todayRank, setTodayRank] = useState<any[]>([])
  const [allRank, setAllRank] = useState<any[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(stored))
    fetchRankings()
  }, [router])

  const fetchRankings = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data: todayData } = await supabase
      .from('invader_scores')
      .select('*')
      .gte('created_at', today)
      .order('score', { ascending: false })
      .limit(10)
    const { data: allData } = await supabase
      .from('invader_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10)
    setTodayRank(todayData || [])
    setAllRank(allData || [])
  }

  const startGame = () => {
    setScore(0)
    setLevel(1)
    setGameOver(false)
    setStarted(true)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const width = 600
    const height = 500
    canvas.width = width
    canvas.height = height

    const game = {
      player: { x: width / 2 - 20, y: height - 40, w: 40, h: 20, speed: 3 },
      bullets: [] as any[],
      enemyBullets: [] as any[],
      invaders: [] as any[],
      invaderDir: 1,
      invaderSpeed: 0.5,
      level: 1,
      score: 0,
      keys: {} as any,
      running: true,
      shootCooldown: 0,
    }

    const spawnWave = (lv: number) => {
      game.invaders = []
      const rows = Math.min(3 + Math.floor(lv / 4), 5)
      const cols = Math.min(7 + Math.floor(lv / 3), 11)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          game.invaders.push({
            x: 50 + col * (500 / cols),
            y: 30 + row * 36,
            w: 28,
            h: 18,
            alive: true,
          })
        }
      }
      game.invaderSpeed = 0.4 + lv * 0.08
      game.invaderDir = 1
    }

    spawnWave(1)
    gameRef.current = game

    const loop = () => {
      if (!game.running) return

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      // プレイヤー
      if (game.keys['ArrowLeft'] || game.keys['a']) game.player.x -= game.player.speed
      if (game.keys['ArrowRight'] || game.keys['d']) game.player.x += game.player.speed
      game.player.x = Math.max(0, Math.min(width - game.player.w, game.player.x))

      ctx.fillStyle = '#ef4444'
      ctx.fillRect(game.player.x, game.player.y, game.player.w, game.player.h)

      // プレイヤー弾
      game.bullets.forEach((b, i) => {
        b.y -= 8
        ctx.fillStyle = '#fca5a5'
        ctx.fillRect(b.x, b.y, 4, 12)
        if (b.y < 0) game.bullets.splice(i, 1)
      })

      // 敵弾（速度・頻度を下げる）
      game.enemyBullets.forEach((b, i) => {
        b.y += 2.5 + game.level * 0.15
        ctx.fillStyle = '#f87171'
        ctx.fillRect(b.x, b.y, 4, 10)
        if (b.y > height) game.enemyBullets.splice(i, 1)

        if (
          b.x < game.player.x + game.player.w &&
          b.x + 4 > game.player.x &&
          b.y < game.player.y + game.player.h &&
          b.y + 10 > game.player.y
        ) {
          game.running = false
          endGame(game.score)
        }
      })

      // インベーダー
      let moveDown = false
      game.invaders.forEach(inv => {
        if (!inv.alive) return
        inv.x += game.invaderDir * game.invaderSpeed
        if (inv.x <= 10 || inv.x >= width - inv.w - 10) moveDown = true

        ctx.fillStyle = '#dc2626'
        ctx.fillRect(inv.x, inv.y, inv.w, inv.h)

        // 弾の頻度を大幅に下げる
        if (Math.random() < 0.0008 + game.level * 0.0002) {
          game.enemyBullets.push({ x: inv.x + inv.w / 2, y: inv.y + inv.h })
        }

        game.bullets.forEach((b, bi) => {
          if (
            b.x < inv.x + inv.w &&
            b.x + 4 > inv.x &&
            b.y < inv.y + inv.h &&
            b.y + 12 > inv.y
          ) {
            inv.alive = false
            game.bullets.splice(bi, 1)
            game.score += 10
            setScore(game.score)
          }
        })

        if (inv.y + inv.h >= game.player.y - 10) {
          game.running = false
          endGame(game.score)
        }
      })

      if (moveDown) {
        game.invaderDir *= -1
        game.invaders.forEach(inv => {
          if (inv.alive) inv.y += 16
        })
      }

      // 全滅でレベルアップ
      if (game.invaders.every(inv => !inv.alive)) {
        game.level++
        setLevel(game.level)
        game.score += 50
        setScore(game.score)
        spawnWave(game.level)
      }

      if (game.running) requestAnimationFrame(loop)
    }

    const endGame = async (finalScore: number) => {
      setGameOver(true)
      setStarted(false)
      if (user && finalScore > 0) {
        await supabase.from('invader_scores').insert({
          name: user.name,
          score: finalScore,
        })
        fetchRankings()
      }
    }

        const keyDown = (e: KeyboardEvent) => {
      game.keys[e.key] = true
    }
    const keyUp = (e: KeyboardEvent) => {
      game.keys[e.key] = false
    }

    const handleCanvasClick = () => {
      if (game.running && game.shootCooldown <= 0) {
        game.bullets.push({
          x: game.player.x + game.player.w / 2 - 2,
          y: game.player.y,
        })
        game.shootCooldown = 12
      }
    }

    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    canvas.addEventListener('click', handleCanvasClick)

    const cooldownLoop = setInterval(() => {
      if (game.shootCooldown > 0) game.shootCooldown--
    }, 16)

    loop()

    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      canvas.removeEventListener('click', handleCanvasClick)
      clearInterval(cooldownLoop)
    }
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-6 border-b border-red-900/50 pb-4">
          <div>
            <div className="text-xs text-red-500 tracking-widest">MINIGAME</div>
            <h1 className="text-5xl font-black tracking-tighter">インベーダー</h1>
          </div>
          <a href="/minigame" className="text-red-400 hover:text-red-300 text-sm tracking-wider">← MINIGAME</a>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!started && !gameOver && (
              <div className="text-center py-12">
                <p className="mb-4 text-slate-400">← → で移動、左クリックで射撃</p>
                <p className="mb-6 text-sm text-red-400">敵を全滅させるとLVが上がります</p>
                <button
                  onClick={startGame}
                  className="px-10 py-4 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black text-xl tracking-wider"
                >
                  START
                </button>
              </div>
            )}

            {started && (
              <div className="mb-4 flex justify-center gap-8 text-lg">
                <div>LV: <span className="text-red-400 font-mono">{level}</span></div>
                <div>SCORE: <span className="text-red-400 font-mono">{score}</span></div>
              </div>
            )}

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="border-2 border-red-900/70 bg-black"
                style={{ display: started || gameOver ? 'block' : 'none' }}
              />
            </div>

            {gameOver && (
              <div className="mt-8 text-center">
                <h2 className="text-3xl font-black mb-4">GAME OVER</h2>
                <div className="text-2xl mb-2">LV: <span className="text-red-400">{level}</span></div>
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
              <h2 className="text-xl font-bold text-red-400 mb-3 tracking-wider">TODAY</h2>
              <div className="space-y-2">
                {todayRank.map((r, i) => (
                  <div key={r.id} className="flex justify-between text-sm p-2 border border-red-900/40 bg-black/30">
                    <span>{i + 1}. {r.name}</span>
                    <span className="text-red-400">{r.score}</span>
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
                    <span className="text-red-400">{r.score}</span>
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