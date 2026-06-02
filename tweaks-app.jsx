// Tweaks app for RG Media Group landing — applies design tokens to :root.
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#F02028",
  "fonts": "Bricolage",
  "hero": "split",
  "density": "regular",
  "dark": false
}/*EDITMODE-END*/;

const ACCENTS = ["#F02028", "#111114", "#1B6FF0", "#FF5A1F"];

const FONT_MAP = {
  Bricolage: { display: "'Bricolage Grotesque', sans-serif", body: "'Hanken Grotesk', sans-serif" },
  Grotesk:   { display: "'Space Grotesk', sans-serif",        body: "'Hanken Grotesk', sans-serif" },
  Serif:     { display: "'Instrument Serif', serif",          body: "'Hanken Grotesk', sans-serif" },
};

const DENSITY = { compact: "0.8", regular: "1", spacious: "1.2" };

// darken a hex color for the pressed state
function darken(hex, amt = 0.16) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(r * (1 - amt)); g = Math.round(g * (1 - amt)); b = Math.round(b * (1 - amt));
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const root = document.documentElement;

  useEffect(() => {
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-press", darken(t.accent, 0.18));
  }, [t.accent]);

  useEffect(() => {
    const f = FONT_MAP[t.fonts] || FONT_MAP.Bricolage;
    root.style.setProperty("--font-display", f.display);
    root.style.setProperty("--font-body", f.body);
  }, [t.fonts]);

  useEffect(() => { root.setAttribute("data-hero", t.hero); }, [t.hero]);
  useEffect(() => {
    root.setAttribute("data-density", t.density);
    root.style.setProperty("--gap", DENSITY[t.density] || "1");
  }, [t.density]);
  useEffect(() => { root.setAttribute("data-theme", t.dark ? "dark" : "light"); }, [t.dark]);

  return (
    <TweaksPanel>
      <TweakSection label="Brand" />
      <TweakColor label="Accent" value={t.accent} options={ACCENTS}
                  onChange={(v) => setTweak("accent", v)} />
      <TweakRadio label="Type" value={t.fonts}
                  options={["Bricolage", "Grotesk", "Serif"]}
                  onChange={(v) => setTweak("fonts", v)} />

      <TweakSection label="Layout" />
      <TweakRadio label="Hero" value={t.hero}
                  options={["split", "center"]}
                  onChange={(v) => setTweak("hero", v)} />
      <TweakRadio label="Density" value={t.density}
                  options={["compact", "regular", "spacious"]}
                  onChange={(v) => setTweak("density", v)} />

      <TweakSection label="Theme" />
      <TweakToggle label="Dark mode" value={t.dark}
                   onChange={(v) => setTweak("dark", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
