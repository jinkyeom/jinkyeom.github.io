(function () {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  };

  ready(function () {
    const toggleThemeBtns = Array.from(
      document.querySelectorAll("#toggle_dark_theme, #mobile_toggle_dark_theme")
    );
    const toggleThemeLabels = Array.from(
      document.querySelectorAll(
        'label[for="toggle_dark_theme"], label[for="mobile_toggle_dark_theme"]'
      )
    );
    const themeLink =
      document.getElementById("theme-css") ||
      document.querySelector('link[rel="stylesheet"][href*="/assets/css/main"]') ||
      document.querySelector('link[rel="stylesheet"][href*="assets/css/main"]');

    if (toggleThemeBtns.length === 0 || !themeLink) {
      console.error("Theme toggle elements not found");
      return;
    }

    const getStoredTheme = () => localStorage.getItem("theme");
    const getSystemTheme = () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const buildThemeHref = (theme) => {
      const nextFile = theme === "dark" ? "main_dark.css" : "main.css";
      const currentHref = themeLink.href || "/assets/css/main.css";
      const nextHref = /main(?:_dark)?\.css/.test(currentHref)
        ? currentHref.replace(/main(?:_dark)?\.css/, nextFile)
        : new URL("/assets/css/" + nextFile, window.location.origin).href;
      const url = new URL(nextHref, window.location.origin);
      const currentUrl = new URL(currentHref, window.location.origin);
      const vParam = currentUrl.searchParams.get("v");

      url.searchParams.set("theme", theme);
      if (vParam) {
        url.searchParams.set("v", vParam);
      }
      return url.href;
    };

    const setToggleLabel = (isDark) => {
      const label = isDark ? "라이트 모드로 전환" : "다크 모드로 전환";
      toggleThemeBtns.forEach((toggleThemeBtn) => {
        toggleThemeBtn.setAttribute("aria-label", label);
      });
      toggleThemeLabels.forEach((toggleThemeLabel) => {
        toggleThemeLabel.setAttribute("aria-label", label);
        toggleThemeLabel.setAttribute("title", label);
      });
    };

    const applyTheme = (theme) => {
      const isDark = theme === "dark";

      themeLink.href = buildThemeHref(theme);
      toggleThemeBtns.forEach((toggleThemeBtn) => {
        toggleThemeBtn.checked = isDark;
      });
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle("theme--dark", isDark);
      document.documentElement.classList.toggle("theme--default", !isDark);
      localStorage.setItem("theme", theme);
      setToggleLabel(isDark);
      document.documentElement.classList.remove("theme--initializing");
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme } }));
    };

    const currentTheme = getStoredTheme();
    const initialTheme = currentTheme || (getSystemTheme() ? "dark" : "default");

    applyTheme(initialTheme);

    toggleThemeBtns.forEach((toggleThemeBtn) => {
      toggleThemeBtn.addEventListener("change", function () {
        applyTheme(toggleThemeBtn.checked ? "dark" : "default");
      });
    });
  });
})();
