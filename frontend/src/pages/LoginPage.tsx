import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await authAPI.login({ username: form.username, password: form.password });
        setAuth(res.user, res.access_token);
        navigate('/');
      } else {
        await authAPI.register(form);
        const res = await authAPI.login({ username: form.username, password: form.password });
        setAuth(res.user, res.access_token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container centered">
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
        background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.1) 0%, #0a0a14 70%)',
      }} />
      <div className="card" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, padding: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, color: 'var(--accent-gold)', marginBottom: 8 }}>
          绘境Online
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
          {mode === 'login' ? '欢迎回来，进入你的幻想世界' : '注册账号，开启冒险之旅'}
        </p>

        {error && (
          <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, marginBottom: 16, color: '#f87171', fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-16">
          <div>
            <label>用户名</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="输入用户名" required minLength={2} />
          </div>
          {mode === 'register' && (
            <>
              <div>
                <label>邮箱</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="输入邮箱" required />
              </div>
              <div>
                <label>昵称</label>
                <input className="input" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="输入昵称（可选）" />
              </div>
            </>
          )}
          <div>
            <label>密码</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="输入密码" required minLength={6} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--accent-purple-light)', cursor: 'pointer', fontSize: 14 }}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? '没有账号？立即注册' : '已有账号？返回登录'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="btn btn-sm" onClick={() => navigate('/')}>← 返回首页</button>
        </div>
      </div>
    </div>
  );
}
