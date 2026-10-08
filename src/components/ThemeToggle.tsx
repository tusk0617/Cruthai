"use client";

export function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("cp-theme", dark ? "dark" : "light"); } catch { /* ignore */ }
  };
  return (
    <button onClick={toggle} className="btn-ghost btn-sm" aria-label="Toggle dark mode" title="Dark / light">
      <span className="dark:hidden">🌙</span><span className="hidden dark:inline">☀️</span>
    </button>
  );
}
