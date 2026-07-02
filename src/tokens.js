export const C = {
  bg:       "var(--bg)",
  surface:  "var(--surface)",
  card:     "var(--card)",
  border:   "var(--border)",
  borderHi: "var(--border-hi)",
  coral:    "#E55266",
  magenta:  "#992A67",
  violet:   "#4E0269",
  text:     "var(--text)",
  sub:      "var(--sub)",
  muted:    "var(--muted)",
  dim:      "var(--dim)",
  teal:     "#3ECFB2",
  amber:    "#F0A04B",
  blue:     "#5BADFF",
  red:      "#FF5272",
  grad:     "linear-gradient(135deg,#E55266,#992A67,#4E0269)",
};

export const LAYOUT = {
  maxWidth: 1200,
  maxWidthNarrow: 760,
  maxWidthMedium: 960,
  space: { xs:8, sm:16, md:24, lg:32, xl:48, xxl:64, xxxl:96 },
  sectionPadding: {
    compact: "56px 40px",
    standard: "80px 40px",
    hero: "70px 40px 40px",
  },
  eyebrow: { fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase" },
  h2: { fontSize:"clamp(26px,4vw,42px)", fontWeight:800, letterSpacing:"-.02em" },
  h3: { fontSize:"clamp(24px,3.2vw,32px)", fontWeight:800, letterSpacing:"-.015em" },
};
