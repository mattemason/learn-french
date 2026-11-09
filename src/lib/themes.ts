/** Theme palettes, applied as CSS variables (space-separated RGB). */

export interface Theme {
  id: string;
  dark: boolean;
  vars: Record<string, string>;
  metaColor: string;
}

const t = (id: string, dark: boolean, metaColor: string, vars: Record<string, string>): Theme => ({ id, dark, vars, metaColor });

export const themes: Record<string, Theme> = {
  'theme-macaron': t('theme-macaron', false, '#fff6f8', {
    bg: '255 246 248', surface: '255 255 255', 'surface-2': '253 235 241', ink: '45 24 56', 'ink-soft': '120 98 128', line: '242 214 225',
    primary: '233 60 112', 'primary-ink': '255 255 255', accent: '38 186 132', 'accent-ink': '255 255 255', sun: '255 176 59', sky: '96 165 250',
    success: '34 177 110', danger: '225 63 76',
  }),
  'theme-minuit': t('theme-minuit', true, '#12142a', {
    bg: '18 20 42', surface: '30 33 64', 'surface-2': '42 46 84', ink: '241 239 252', 'ink-soft': '168 170 205', line: '58 62 104',
    primary: '255 196 84', 'primary-ink': '30 22 8', accent: '255 112 134', 'accent-ink': '30 10 16', sun: '255 196 84', sky: '125 200 255',
    success: '74 222 150', danger: '255 108 120',
  }),
  'theme-lavande': t('theme-lavande', false, '#f7f3ff', {
    bg: '247 243 255', surface: '255 255 255', 'surface-2': '236 228 255', ink: '40 28 74', 'ink-soft': '112 100 150', line: '224 214 250',
    primary: '122 84 232', 'primary-ink': '255 255 255', accent: '255 132 84', 'accent-ink': '255 255 255', sun: '247 186 48', sky: '86 196 170',
    success: '40 170 120', danger: '220 64 92',
  }),
  'theme-riviera': t('theme-riviera', false, '#effaf9', {
    bg: '239 250 249', surface: '255 255 255', 'surface-2': '218 244 241', ink: '14 46 60', 'ink-soft': '80 116 128', line: '196 232 228',
    primary: '0 145 155', 'primary-ink': '255 255 255', accent: '255 98 78', 'accent-ink': '255 255 255', sun: '255 192 50', sky: '64 156 230',
    success: '22 163 106', danger: '222 60 60',
  }),
  'theme-bordeaux': t('theme-bordeaux', true, '#2a0f1b', {
    bg: '42 15 27', surface: '64 25 41', 'surface-2': '84 36 56', ink: '255 240 236', 'ink-soft': '214 176 184', line: '106 50 72',
    primary: '233 184 92', 'primary-ink': '42 20 6', accent: '240 106 128', 'accent-ink': '40 8 16', sun: '233 184 92', sky: '160 214 190',
    success: '128 222 166', danger: '255 120 130',
  }),
};

export function applyTheme(id: string) {
  const theme = themes[id] ?? themes['theme-macaron'];
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme.vars)) root.style.setProperty(`--${k}`, v);
  root.dataset.theme = theme.dark ? 'dark' : 'light';
  root.style.colorScheme = theme.dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.metaColor);
}
