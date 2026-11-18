(() => {
  const storageKey = 'exchange-lab-theme';
  let theme = 'light';
  let hasSavedTheme = false;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') { theme = saved; hasSavedTheme = true; }
  } catch (_) {}
  if (!hasSavedTheme && window.matchMedia?.('(prefers-color-scheme: dark)').matches) theme = 'dark';

  const applyTheme = (nextTheme) => {
    theme = nextTheme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = theme === 'dark' ? '#0B1220' : '#F4F7FA';
    const button = document.querySelector('#themeToggle');
    if (button) {
      const isDark = theme === 'dark';
      button.querySelector('.theme-icon').textContent = isDark ? '☾' : '☼';
      button.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      button.title = `Switch to ${isDark ? 'light' : 'dark'} mode`;
      button.setAttribute('aria-pressed', String(isDark));
    }
  };

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const initialMetaTheme = document.querySelector('meta[name="theme-color"]');
  if (initialMetaTheme) initialMetaTheme.content = theme === 'dark' ? '#070B14' : '#F6F8FC';
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(theme);
    document.querySelector('#themeToggle')?.addEventListener('click', () => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      try { localStorage.setItem(storageKey, nextTheme); } catch (_) {}
    });
  }, { once: true });
})();
