"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types";
import type { User } from "@supabase/supabase-js";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";

export default function Home() {
  // ========================================
  // State の定義
  // ========================================

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // ========================================
  // Hooks の初期化
  // ========================================

  const router = useRouter();
  const supabase = createClient();

  // ========================================
  // 初期化処理
  // ========================================

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);
    setLoading(false);
    fetchPosts(user.id);
  };

  // ========================================
  // 投稿一覧を取得
  // ========================================

  const fetchPosts = async (userId?: string) => {
    try {
      const url = userId ? `${API_URL}/api/posts?userId=${userId}` : `${API_URL}/api/posts`;

      const response = await fetch(url);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // ========================================
  // 画像をアップロード
  // ========================================

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage.from("images").upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // ========================================
  // 投稿を作成（画像付き）
  // ========================================

  const handleSubmit = async (e: React.FormEvent, imageFile: File | null) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    setUploading(true);

    try {
      let imageUrl: string | null = null;

      // 画像が選択されていればアップロード
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          alert("画像のアップロードに失敗しました");
          setUploading(false);
          return;
        }
      }

      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newPost,
          imageUrl,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("投稿に失敗しました");
      }

      setNewPost("");
      fetchPosts(user.id);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setUploading(false);
    }
  };

  // ========================================
  // いいね処理
  // ========================================

  const handleLike = async (postId: number, isLiked: boolean) => {
    if (!user) return;

    setAnimatingId(postId);
    setTimeout(() => setAnimatingId(null), 400);

    try {
      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("いいねに失敗しました");
      }

      const data = await response.json();

      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likeCount: data.likeCount,
              isLiked: data.isLiked,
            };
          }
          return post;
        }),
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // ========================================
  // 投稿を削除
  // ========================================

  const handleDelete = async (id: number) => {
    if (!confirm("この投稿を削除しますか？")) return;

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      fetchPosts(user?.id);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // ========================================
  // ログアウト処理
  // ========================================

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ========================================
  // ローディング中
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // ========================================
  // UI（コンポーネントを使用）
  // ========================================

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <Header userInitial={user?.email?.charAt(0).toUpperCase()} onLogout={handleLogout} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 投稿フォーム */}
        <PostForm userInitial={user?.email?.charAt(0).toUpperCase()} value={newPost} onChange={setNewPost} onSubmit={handleSubmit} disabled={uploading} />

        {/* タイムライン */}
        <div className="space-y-4">{posts.length === 0 ? <div className="text-center text-white/50 py-12">まだ投稿がありません</div> : posts.map((post) => <PostCard key={post.id} post={post} onDelete={handleDelete} onLike={handleLike} isAnimating={animatingId === post.id} />)}</div>
      </main>
    </div>
  );
}
