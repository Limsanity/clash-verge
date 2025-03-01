import useSWR from "swr";
import { useMemo } from "react";
import { createTheme } from "@mui/material";
import { getVergeConfig } from "../../services/cmds";
import { defaultTheme, defaultDarkTheme } from "../../pages/_theme";

/**
 * custome theme
 */
export default function useCustomTheme() {
  const { data } = useSWR("getVergeConfig", getVergeConfig);
  const { theme_mode, theme_setting } = data ?? {};

  const theme = useMemo(() => {
    const mode = theme_mode ?? "light";

    const setting = theme_setting || {};
    const dt = mode === "light" ? defaultTheme : defaultDarkTheme;

    const theme = createTheme({
      breakpoints: {
        values: { xs: 0, sm: 650, md: 900, lg: 1200, xl: 1536 },
      },
      palette: {
        mode,
        primary: { main: setting.primary_color || dt.primary_color },
        secondary: { main: setting.secondary_color || dt.secondary_color },
        info: { main: setting.info_color || dt.info_color },
        error: { main: setting.error_color || dt.error_color },
        warning: { main: setting.warning_color || dt.warning_color },
        success: { main: setting.success_color || dt.success_color },
        text: {
          primary: setting.primary_text || dt.primary_text,
          secondary: setting.secondary_text || dt.secondary_text,
        },
      },
      typography: {
        // todo
        fontFamily: setting.font_family
          ? `${setting.font_family}, ${dt.font_family}`
          : dt.font_family,
      },
    });

    // css
    const selectColor = mode === "light" ? "#f5f5f5" : "#d5d5d5";
    const scrollColor = mode === "light" ? "#90939980" : "#54545480";

    const rootEle = document.documentElement;
    rootEle.style.background = "transparent";
    rootEle.style.setProperty("--selection-color", selectColor);
    rootEle.style.setProperty("--scroller-color", scrollColor);
    rootEle.style.setProperty("--primary-main", theme.palette.primary.main);

    // inject css
    let style = document.querySelector("style#verge-theme");
    if (!style) {
      style = document.createElement("style");
      style.id = "verge-theme";
      document.head.appendChild(style!);
    }
    if (style) {
      style.innerHTML = setting.css_injection || "";
    }

    // update svg icon
    const { palette } = theme;

    setTimeout(() => {
      const dom = document.querySelector("#Gradient2");
      if (dom) {
        dom.innerHTML = `
        <stop offset="0%" stop-color="${palette.primary.main}" />
        <stop offset="80%" stop-color="${palette.primary.dark}" />
        <stop offset="100%" stop-color="${palette.primary.dark}" />
        `;
      }
    }, 0);

    return theme;
  }, [theme_mode, theme_setting]);

  return { theme };
}
