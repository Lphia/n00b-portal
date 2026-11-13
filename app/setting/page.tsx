'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [section, setSection] = useState('profile')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [gear, setGear] = useState<any>({})
  const [gameSettings, setGameSettings] = useState<any[]>([])
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [currentCategory, setCurrentCategory] = useState('')

  // 切り取り用
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [showCrop, setShowCrop] = useState(false)
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 80, height: 80, x: 10, y: 10 })
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('n00b_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    setName(u.name)
    setGender(u.gender || '')
    setAvatarUrl(u.avatar_url || '')
    setGear(u.gear || {})
    setGameSettings(u.game_settings || [])
  }, [router])

  // 画像を切り取ってBlobにする
  const getCroppedImg = async (): Promise<Blob | null> => {
    const image = imgRef.current
    if (!image || !crop.width || !crop.height) return null

    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const pixelCrop: PixelCrop = {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
      unit: 'px',
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
    })
  }

  const handleCropConfirm = async () => {
    if (!user) return
    setUploading(true)
    const blob = await getCroppedImg()
    if (!blob) {
      setMessage('切り取りに失敗しました')
      setUploading(false)
      return
    }

    const fileName = `${user.id}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' })

    if (uploadError) {
      setMessage('アップロード失敗: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    const publicUrl = data.publicUrl + '?t=' + Date.now() // キャッシュ回避

    await supabase.from('members').update({ avatar_url: publicUrl }).eq('id', user.id)

    const updated = { ...user, avatar_url: publicUrl }
    localStorage.setItem('n00b_user', JSON.stringify(updated))
    setUser(updated)
    setAvatarUrl(publicUrl)
    setShowCrop(false)
    setCropSrc(null)
    setMessage('アイコンを更新しました')
    setUploading(false)
  }

  const saveProfile = async () => {
    await supabase.from('members').update({ name, gender }).eq('id', user.id)
    const updated = { ...user, name, gender }
    localStorage.setItem('n00b_user', JSON.stringify(updated))
    setUser(updated)
    setMessage('保存しました')
  }

  const saveGear = async () => {
    await supabase.from('members').update({ gear }).eq('id', user.id)
    const updated = { ...user, gear }
    localStorage.setItem('n00b_user', JSON.stringify(updated))
    setUser(updated)
    setMessage('GEARを保存しました')
  }

  const saveGames = async () => {
    await supabase.from('members').update({ game_settings: gameSettings }).eq('id', user.id)
    const updated = { ...user, game_settings: gameSettings }
    localStorage.setItem('n00b_user', JSON.stringify(updated))
    setUser(updated)
    setMessage('ゲーム設定を保存しました')
  }

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('すべて入力してください')
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage('新しいパスワードが一致しません')
      return
    }
    if (currentPassword !== user.password) {
      setMessage('現在のパスワードが違います')
      return
    }
    const { error } = await supabase.from('members').update({ password: newPassword }).eq('id', user.id)
    if (error) {
      setMessage('変更失敗: ' + error.message)
    } else {
      const updated = { ...user, password: newPassword }
      localStorage.setItem('n00b_user', JSON.stringify(updated))
      setUser(updated)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setMessage('パスワードを変更しました')
    }
  }

  const searchAmazon = async (category: string) => {
    if (!searchQuery.trim()) { setMessage('検索ワードを入力してください'); return }
    setSearching(true); setCurrentCategory(category); setSearchResults([]); setMessage('')
    try {
      const url = `https://rest.canopyapi.co/api/amazon/search?searchTerm=${encodeURIComponent(searchQuery)}&domain=JP`
      const res = await fetch(url, { headers: { 'API-KEY': process.env.NEXT_PUBLIC_CANOPY_API_KEY || '' } })
      const data = await res.json()
      const products = data?.data?.amazonProductSearchResults?.productResults?.results || []
      setSearchResults(products)
      setMessage(products.length ? `${products.length}件見つかりました` : '商品が見つかりませんでした')
    } catch { setMessage('検索エラーが発生しました') }
    setSearching(false)
  }

  const selectProduct = (product: any) => {
    setGear({
      ...gear,
      [currentCategory]: {
        name: product.title || '不明な商品',
        image: product.mainImageUrl || '',
        url: product.url || '',
        asin: product.asin || '',
      },
    })
    setSearchResults([]); setSearchQuery('')
    setMessage(`${currentCategory} を設定しました`)
  }

  if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center">LOADING...</div>

  const categories = ['マウス', 'キーボード', 'マウスパッド', 'モニター', 'イヤホン', 'マイク', 'CPU', 'GPU', 'RAM']

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white flex">
      <aside className="w-64 border-r border-red-900/50 p-6">
        <div className="text-xs text-red-500 tracking-widest mb-6">SETTINGS</div>
        {[{ id: 'profile', label: 'プロフィール詳細設定' }, { id: 'gear', label: 'MY GEAR' }, { id: 'gamesetting', label: 'MY GAME SETTING' }, { id: 'password', label: 'パスワード変更' }].map(item => (
          <button key={item.id} onClick={() => setSection(item.id)} className={`w-full text-left px-4 py-3 text-sm mb-1 ${section === item.id ? 'bg-red-950/50 border-l-2 border-red-500 text-red-400' : 'hover:bg-red-950/30'}`}>
            {item.label}
          </button>
        ))}
        <a href="/" className="block mt-10 text-xs text-red-400">← RETURN</a>
      </aside>

      <div className="flex-1 p-10 overflow-auto">
        {section === 'profile' && (
          <div className="max-w-lg">
            <h1 className="text-4xl font-black mb-8">プロフィール詳細設定</h1>

            {avatarUrl && (
              <img src={avatarUrl} className="w-32 h-32 object-cover border border-red-900 mb-4" />
            )}

            <div className="mb-6">
              <label className="inline-block px-6 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black cursor-pointer transition text-sm">
                アイコンを選択して切り取り
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (!e.target.files?.[0]) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      setCropSrc(reader.result as string)
                      setShowCrop(true)
                    }
                    reader.readAsDataURL(e.target.files[0])
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* 切り取りモーダル */}
            {showCrop && cropSrc && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    aspect={1}
                  >
                    <img ref={imgRef} src={cropSrc} alt="crop" className="max-w-full" />
                  </ReactCrop>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleCropConfirm}
                      disabled={uploading}
                      className="px-6 py-2 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black disabled:opacity-50"
                    >
                      {uploading ? 'アップロード中...' : 'この範囲で確定'}
                    </button>
                    <button onClick={() => { setShowCrop(false); setCropSrc(null) }} className="px-4 py-2 text-slate-400">
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-black/60 border border-red-900" placeholder="名前" />
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-3 bg-black/60 border border-red-900">
                <option value="">性別を選択</option>
                <option value="男性">男性</option>
                <option value="女性">女性</option>
                <option value="その他">その他</option>
                <option value="未回答">未回答</option>
              </select>
              <button onClick={saveProfile} className="px-6 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black">保存</button>
            </div>
          </div>
        )}

        {section === 'gear' && (
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black mb-8">MY GEAR</h1>
            {categories.map(cat => (
              <div key={cat} className="mb-6 p-4 border border-red-900/40">
                <div className="text-sm text-red-400 mb-2">{cat}</div>
                {gear[cat]?.name ? (
                  <div className="flex items-center gap-4">
                    {gear[cat].image && <img src={gear[cat].image} className="w-20 h-20 object-contain bg-white border border-red-900" />}
                    <div className="flex-1">
                      <div className="text-sm">{gear[cat].name}</div>
                      {gear[cat].url && <a href={gear[cat].url} target="_blank" className="text-xs text-red-400 hover:underline">Amazonで見る</a>}
                    </div>
                    <button onClick={() => setGear({ ...gear, [cat]: null })} className="text-xs text-red-500">削除</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={currentCategory === cat ? searchQuery : ''} onChange={e => { setSearchQuery(e.target.value); setCurrentCategory(cat) }} onKeyDown={e => e.key === 'Enter' && searchAmazon(cat)} className="flex-1 px-3 py-2 bg-black/60 border border-red-900 text-sm" placeholder={`${cat}を検索`} />
                    <button onClick={() => searchAmazon(cat)} disabled={searching} className="px-4 py-2 border border-red-500 text-red-400 text-sm">{searching && currentCategory === cat ? '検索中...' : '検索'}</button>
                  </div>
                )}
                {currentCategory === cat && searchResults.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {searchResults.slice(0, 9).map((p: any, i: number) => (
                      <button key={i} onClick={() => selectProduct(p)} className="text-left p-2 border border-red-900/50 hover:border-red-400 text-xs bg-black/40">
                        {p.mainImageUrl ? <img src={p.mainImageUrl} className="w-full h-24 object-contain mb-2 bg-white" /> : <div className="w-full h-24 bg-slate-800 flex items-center justify-center text-slate-500 mb-2">No Image</div>}
                        <div className="line-clamp-2">{p.title}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button onClick={saveGear} className="mt-6 px-6 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black">すべて保存</button>
          </div>
        )}

        {section === 'gamesetting' && (
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black mb-8">MY GAME SETTING</h1>
            {gameSettings.map((g, i) => (
              <div key={i} className="mb-6 p-4 border border-red-900/50">
                <input value={g.game || ''} onChange={e => { const n = [...gameSettings]; n[i].game = e.target.value; setGameSettings(n) }} className="w-full mb-3 px-3 py-2 bg-black/60 border border-red-900" placeholder="ゲーム名" />
                <div className="flex gap-3 mb-3">
                  <input type="number" value={g.dpi || ''} onChange={e => { const n = [...gameSettings]; n[i].dpi = e.target.value; setGameSettings(n) }} className="flex-1 px-3 py-2 bg-black/60 border border-red-900" placeholder="DPI" />
                  <input type="number" step="0.01" value={g.sens || ''} onChange={e => { const n = [...gameSettings]; n[i].sens = e.target.value; setGameSettings(n) }} className="flex-1 px-3 py-2 bg-black/60 border border-red-900" placeholder="感度" />
                </div>
                <button onClick={() => setGameSettings(gameSettings.filter((_, idx) => idx !== i))} className="text-xs text-red-400">削除</button>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setGameSettings([...gameSettings, { game: '', dpi: '', sens: '' }])} className="px-4 py-2 border border-red-500 text-red-400">ゲームを追加</button>
              <button onClick={saveGames} className="px-6 py-2 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black">保存</button>
            </div>
          </div>
        )}

        {section === 'password' && (
          <div className="max-w-md">
            <h1 className="text-4xl font-black mb-8">パスワード変更</h1>
            <div className="space-y-4">
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 bg-black/60 border border-red-900" placeholder="現在のパスワード" />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-black/60 border border-red-900" placeholder="新しいパスワード" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-black/60 border border-red-900" placeholder="新しいパスワード（確認）" />
              <button onClick={changePassword} className="px-6 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black">変更する</button>
            </div>
          </div>
        )}

        {message && <p className="mt-6 text-sm text-red-300">{message}</p>}
      </div>
    </main>
  )
}