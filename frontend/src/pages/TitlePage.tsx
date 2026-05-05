import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const soundManager = {
  ctx: null as AudioContext | null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  },
  play(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
    this.init();
    const o = this.ctx!.createOscillator();
    const g = this.ctx!.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, this.ctx!.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + dur);
    o.connect(g); g.connect(this.ctx!.destination);
    o.start(); o.stop(this.ctx!.currentTime + dur);
  },
  hover() { this.play(600, 0.1, 'sine', 0.04); },
  click() { this.play(800, 0.15, 'sine', 0.06); },
  select() { this.play(1000, 0.2, 'triangle', 0.08); },
};

export default function TitlePage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.5, a: Math.random() * 0.5 + 0.2,
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.a * (0.5 + 0.5 * Math.sin(frame * 0.02 + p.x))})`;
        ctx.fill();
      });

      const cx = w / 2, cy = h / 2;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(frame * 0.002);

      for (let i = 0; i < 3; i++) {
        const r1 = 120 + i * 30;
        ctx.beginPath();
        for (let j = 0; j <= 100; j++) {
          const a = (j / 100) * Math.PI * 2 + i * 1.2;
          const rr = r1 + Math.sin(j * 8 + frame * 0.03) * 15;
          const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(139,92,246,${0.1 - i * 0.03})`;
        ctx.lineWidth = 1; ctx.stroke();
      }

      ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(0, 0, 30, 0, 0, 80);
      grad.addColorStop(0, 'rgba(139,92,246,0.15)'); grad.addColorStop(1, 'rgba(34,211,238,0.02)');
      ctx.fillStyle = grad; ctx.fill();

      ctx.restore();
      requestAnimationFrame(animate);
    };
    animate();

    return () => { window.removeEventListener('resize', resize); };
  }, []);

  const menuItems = [
    { label: '🏰 创建世界', desc: '用AI生成你的专属互动世界', action: () => { soundManager.select(); navigate('/create'); }, requireAuth: true },
    { label: '🤖 AI生成向导', desc: '分步AI辅助创建完整世界', action: () => { soundManager.select(); navigate('/ai-wizard'); }, requireAuth: true },
    { label: '📚 世界书广场', desc: '探索其他创作者的世界', action: () => { soundManager.select(); navigate('/store'); }, requireAuth: false },
    { label: '🎭 角色库', desc: '浏览和创建专属角色卡', action: () => { soundManager.select(); navigate('/characters'); }, requireAuth: false },
    ...(isLoggedIn ? [
      { label: '🎒 我的背包', desc: '管理已拥有的世界书', action: () => { soundManager.select(); navigate('/backpack'); }, requireAuth: true },
      { label: '📖 我的世界书', desc: '编辑和管理创作内容', action: () => { soundManager.select(); navigate('/store?my=true'); }, requireAuth: true },
    ] : []),
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-gold)' }}>⚗️ 绘境Online</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  {user?.nickname || user?.username} · Lv{user?.level} · 🪙{user?.coins}
                </span>
                <button className="btn btn-sm" onClick={() => { soundManager.click(); logout(); }}>退出</button>
              </>
            ) : (
              <button className="btn btn-sm btn-primary" onClick={() => { soundManager.click(); navigate('/login'); }}>登录</button>
            )}
          </div>
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 900, textAlign: 'center',
            background: 'linear-gradient(135deg, #d4a853, #c9a44b, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s linear infinite',
            backgroundSize: '200% auto',
            marginBottom: 16,
          }}>
            绘境Online
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 22px)', color: 'var(--text-secondary)',
            textAlign: 'center', maxWidth: 600, marginBottom: 48, lineHeight: 1.8,
          }}>
            AI互动视频游戏平台 · 让每个人都能创造和体验无限世界
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, maxWidth: 800, width: '100%' }}>
            {menuItems.map((item, i) => (
              <button
                key={i}
                className="card"
                style={{
                  cursor: 'pointer', textAlign: 'left', padding: '24px 20px',
                  animation: `fadeIn 0.5s ${i * 0.1}s both`,
                  border: '1px solid rgba(200,160,80,0.25)',
                }}
                onClick={() => {
                  if (item.requireAuth && !isLoggedIn) {
                    soundManager.click();
                    navigate('/login');
                    return;
                  }
                  item.action();
                }}
                onMouseEnter={() => soundManager.hover()}
              >
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                  {item.label}
                  {item.requireAuth && !isLoggedIn && (
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>需登录</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.desc}</div>
              </button>
            ))}
          </div>
        </main>

        <footer style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: 12 }}>
          绘境Online © 2026 · AI Native 互动娱乐平台
        </footer>
      </div>
    </div>
  );
}
