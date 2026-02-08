// ========================================
// メインページ（UIのみ）
// ========================================
// API連携・認証は Day2 で実装します

import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";
import { SamplePost } from "@/types";

// サンプルデータ（Day2 で API から取得するように変更）
const samplePosts: SamplePost[] = [
  {
    id: 1,
    username: "tanaka",
    content: "今日はプログラミング日和！React楽しい 🚀",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    likes: 24,
    isLiked: false,
    createdAt: "5分前",
  },
  {
    id: 2,
    username: "suzuki",
    content: "カフェでコーディング中 ☕️\n集中できていい感じ！",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
    likes: 18,
    isLiked: true,
    createdAt: "30分前",
  },
  {
    id: 3,
    username: "yamada",
    content: "Next.js 14 の新機能試してみた。Server Actions 便利すぎる！",
    image: null,
    likes: 42,
    isLiked: false,
    createdAt: "1時間前",
  },
  {
    id: 4,
    username: "sato",
    content: "今日のランチ 🍜",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
    likes: 8,
    isLiked: false,
    createdAt: "2時間前",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header userInitial="Y" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <PostForm userInitial="Y" />

        {/* タイムライン */}
        <div className="space-y-4">
          {samplePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
}
