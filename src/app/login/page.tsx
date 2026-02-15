"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ========================================
// ログインページコンポーネント
// ========================================

export default function LoginPage() {
  // ========================================
  // State（状態）の定義
  // ========================================

  const [email, setEmail] = useState("");
  // → メールアドレスの入力値を保持

  const [password, setPassword] = useState("");
  // → パスワードの入力値を保持

  const [isLogin, setIsLogin] = useState(true);
  // → true: ログイン / false: 新規登録

  const [error, setError] = useState("");
  // → エラーメッセージを保持

  const [loading, setLoading] = useState(false);
  // → 処理中かどうか（ボタンの無効化に使う）

  // ========================================
  // Hooks（フック）の初期化
  // ========================================

  const router = useRouter();
  // → ページ遷移用

  const supabase = createClient();
  // → Supabase クライアント

  // ========================================
  // 認証処理
  // ========================================

  const handleAuth = async (e: React.FormEvent) => {
    // フォーム送信時のページリロードを防ぐ
    e.preventDefault();

    // エラーをクリア
    setError("");

    // ローディング開始
    setLoading(true);

    try {
      if (isLogin) {
        // ========================================
        // ログイン処理
        // ========================================
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        // → signInWithPassword: メール/パスワードでログイン
        //   成功すると Cookie にトークンが保存される

        if (error) throw error;
        // → エラーがあれば catch ブロックへ

        // ログイン成功 → トップページへ
        router.push("/");
        // → "/" に遷移

        router.refresh();
        // → ページをリフレッシュして認証状態を反映
        //   これがないと古い状態が表示されることがある
      } else {
        // ========================================
        // 新規登録処理
        // ========================================
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        // → signUp: 新規ユーザーを登録
        //   ※ メール確認が必要な設定の場合は確認メールが送られる

        if (error) throw error;

        // 登録成功 → トップページへ
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      // エラーが発生したらメッセージを表示
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      // → err が Error オブジェクトならその message を使う
      //   そうでなければデフォルトメッセージ
    } finally {
      // 処理完了後、ローディングを終了
      // finally = try でも catch でも最後に必ず実行される
      setLoading(false);
    }
  };

  // ========================================
  // UI の描画
  // ========================================

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/10">
        {/* タイトル */}
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          <span className="text-4xl mr-2">✨</span>
          SNS App
        </h1>

        {/* タブ切り替え（ログイン / 新規登録） */}
        <div className="flex mb-6">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-center transition${isLogin ? "text-white border-b-2 border-purple-500" : "text-white/50 border-b border-white/10"}`}>
            ログイン
          </button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-center transition${!isLogin ? "text-white border-b-2 border-purple-500" : "text-white/50 border-b border-white/10"}`}>
            新規登録
          </button>
        </div>

        {/* エラーメッセージ */}
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {/* フォーム */}
        <form onSubmit={handleAuth} className="space-y-4">
          {/* メールアドレス */}
          <div>
            <label className="block text-white/70 text-sm mb-2">メールアドレス</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition" placeholder="example@email.com" />
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-white/70 text-sm mb-2">パスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition" placeholder="6文字以上" />
          </div>

          {/* 送信ボタン */}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all">
            {loading ? "処理中..." : isLogin ? "ログイン" : "新規登録"}
          </button>
        </form>
      </div>
    </div>
  );
}
