(function () {
  const defaultTheme = [...document.styleSheets].find((style) =>
    /\/main\.css(\?|$)/.test(style.href || "")
  );
  const darkTheme = [...document.styleSheets].find((style) =>
    /\/main_dark\.css(\?|$)/.test(style.href || "")
  );
  const toggleThemeBtn = document.getElementById("toggle_dark_theme");
  const toggleThemeLabel = document.querySelector('label[for="toggle_dark_theme"]');

  if (!defaultTheme || !darkTheme || !toggleThemeBtn) {
    return;
  }

  const getStoredTheme = () => localStorage.getItem("theme");
  const getSystemTheme = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const setToggleLabel = (isDark) => {
    const label = isDark ? "라이트 모드로 전환" : "다크 모드로 전환";
    toggleThemeBtn.setAttribute("aria-label", label);

    if (toggleThemeLabel) {
      toggleThemeLabel.setAttribute("aria-label", label);
      toggleThemeLabel.setAttribute("title", label);
    }
  };

  const setDarkMode = (isDark) => {
    darkTheme.disabled = !isDark;
    defaultTheme.disabled = isDark;
    toggleThemeBtn.checked = isDark;
    document.documentElement.dataset.theme = isDark ? "dark" : "default";
    document.documentElement.classList.toggle("theme--dark", isDark);
    document.documentElement.classList.toggle("theme--default", !isDark);
    localStorage.setItem("theme", isDark ? "dark" : "default");
    setToggleLabel(isDark);
  };

  const currentTheme = getStoredTheme();
  const isDarkMode = currentTheme ? currentTheme === "dark" : getSystemTheme();

  setDarkMode(isDarkMode);

  toggleThemeBtn.addEventListener("change", (event) => {
    setDarkMode(event.target.checked);
  });
})();
