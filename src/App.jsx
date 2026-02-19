import { useMemo, useState } from 'react';

const tabs = [
  { id: 'feed', label: 'Лента', icon: '▶' },
  { id: 'search', label: 'Поиск', icon: '⌕' },
  { id: 'profile', label: 'Профиль', icon: '◉' },
];

const feedVideos = [
  {
    id: 1,
    title: 'Закат на крыше: 15 секунд спокойствия',
    author: 'moon.travel',
    avatar: '🌙',
    likes: '128K',
    comments: '3.4K',
    shares: '986',
    gradient: 'from-violet-500/80 via-fuchsia-500/70 to-rose-500/75',
  },
  {
    id: 2,
    title: 'Утренний workout без оборудования',
    author: 'fitflow',
    avatar: '💪',
    likes: '84K',
    comments: '1.1K',
    shares: '642',
    gradient: 'from-cyan-500/80 via-sky-500/70 to-indigo-500/75',
  },
  {
    id: 3,
    title: 'Рецепт пасты за 7 минут',
    author: 'chef.nika',
    avatar: '🍝',
    likes: '210K',
    comments: '7.8K',
    shares: '2.6K',
    gradient: 'from-amber-400/85 via-orange-500/75 to-red-500/70',
  },
];

function VideoCard({ video }) {
  return (
    <article className="relative h-[70vh] snap-start overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
      <div className={`absolute inset-0 bg-gradient-to-b ${video.gradient}`} />
      <div className="absolute inset-0 bg-black/20" />

      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4 text-white">
        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-xl backdrop-blur-sm">❤️</button>
        <span className="text-xs font-semibold">{video.likes}</span>
        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-xl backdrop-blur-sm">💬</button>
        <span className="text-xs font-semibold">{video.comments}</span>
        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-xl backdrop-blur-sm">↗</button>
        <span className="text-xs font-semibold">{video.shares}</span>
      </div>

      <div className="absolute bottom-4 left-4 right-20 text-white">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base text-zinc-900">{video.avatar}</span>
          @{video.author}
        </div>
        <p className="text-sm leading-snug text-zinc-100">{video.title}</p>
      </div>
    </article>
  );
}

function FeedScreen() {
  return (
    <div className="h-full space-y-3 overflow-y-auto p-3 pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {feedVideos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function SearchScreen() {
  const tags = ['travel', 'sport', 'music', 'food', 'design', 'coding'];

  return (
    <div className="h-full overflow-y-auto p-4 pb-24 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-zinc-300">🔎 Поиск авторов и трендов...</div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {tags.map((tag, index) => (
          <div
            key={tag}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br p-4 text-sm font-medium capitalize ${
              index % 2 === 0 ? 'from-cyan-500/40 to-indigo-500/50' : 'from-pink-500/40 to-orange-500/50'
            }`}
          >
            #{tag}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen() {
  const stats = useMemo(
    () => [
      ['Подписчики', '482K'],
      ['Подписки', '312'],
      ['Лайки', '9.1M'],
    ],
    [],
  );

  return (
    <div className="h-full p-4 pb-24 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl">
          🧑
        </div>
        <h2 className="text-center text-lg font-semibold">@you.creator</h2>
        <p className="mt-1 text-center text-sm text-zinc-300">Visual stories • tutorials • vlogs</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white/5 py-2">
              <div className="font-semibold">{value}</div>
              <div className="text-zinc-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Screen({ activeTab }) {
  if (activeTab === 'search') return <SearchScreen />;
  if (activeTab === 'profile') return <ProfileScreen />;
  return <FeedScreen />;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="relative h-[760px] w-[360px] rounded-[3rem] border-[10px] border-zinc-800 bg-black shadow-[0_30px_80px_rgba(0,0,0,.65)]">
        <div className="absolute left-1/2 top-0 h-7 w-40 -translate-x-1/2 rounded-b-2xl bg-zinc-800" />

        <div className="h-full overflow-hidden rounded-[2.4rem] bg-zinc-950">
          <Screen activeTab={activeTab} />

          <nav className="absolute bottom-2 left-3 right-3 flex rounded-2xl border border-white/10 bg-zinc-900/95 p-1 backdrop-blur">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 flex-col items-center rounded-xl py-2 text-xs transition ${
                    isActive ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </main>
  );
}
