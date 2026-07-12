(function () {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  };

  ready(function () {
    const toggleThemeBtn = document.getElementById("toggle_dark_theme");
    const toggleThemeLabel = document.querySelector('label[for="toggle_dark_theme"]');
    const themeLink =
      document.getElementById("theme-css") ||
      document.querySelector('link[rel="stylesheet"][href*="/assets/css/main"]') ||
      document.querySelector('link[rel="stylesheet"][href*="assets/css/main"]');

    if (!toggleThemeBtn || !themeLink) {
      console.error("Theme toggle elements not found");
      return;
    }

    const getStoredTheme = () => localStorage.getItem("theme");
    const getSystemTheme = () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const buildThemeHref = (isDark) => {
      const nextFile = isDark ? "main_dark.css" : "main.css";
      const currentHref = themeLink.href || "/assets/css/main.css";

      if (/main(?:_dark)?\.css/.test(currentHref)) {
        return currentHref.replace(/main(?:_dark)?\.css/, nextFile);
      }

      return new URL("/assets/css/" + nextFile, window.location.origin).href;
    };

    const setToggleLabel = (isDark) => {
      const label = isDark ? "라이트 모드로 전환" : "다크 모드로 전환";
      toggleThemeBtn.setAttribute("aria-label", label);

      if (toggleThemeLabel) {
        toggleThemeLabel.setAttribute("aria-label", label);
        toggleThemeLabel.setAttribute("title", label);
      }
    };

    const applyTheme = (theme) => {
      const isDark = theme === "dark";

      themeLink.href = buildThemeHref(isDark);
      toggleThemeBtn.checked = isDark;
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle("theme--dark", isDark);
      document.documentElement.classList.toggle("theme--default", !isDark);
      localStorage.setItem("theme", theme);
      setToggleLabel(isDark);
    };

    const currentTheme = getStoredTheme();
    const initialTheme = currentTheme || (getSystemTheme() ? "dark" : "default");

    applyTheme(initialTheme);

    toggleThemeBtn.addEventListener("change", function () {
      applyTheme(toggleThemeBtn.checked ? "dark" : "default");
    });
  });
})();
