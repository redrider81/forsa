/** Unified CVB portal palette — charts, badges and status share the same tones. */
export const portalColors = {
  teal: "#6BB5A8",
  tealDark: "#3F7569",
  tealSoft: "#DFF0EC",
  tealBorder: "#B8DDD6",

  mint: "#8FC49A",
  mintSoft: "#E8F4EA",

  amber: "#D4A96A",
  amberDark: "#8A6535",
  amberSoft: "#FFF4E5",
  amberBorder: "#EDD9B8",

  coral: "#D99284",
  coralDark: "#9E5A4E",
  coralSoft: "#FAECE8",
  coralBorder: "#EFD0C8",

  lavender: "#A898C8",
  lavenderDark: "#65578A",
  lavenderSoft: "#F0ECF6",

  slate: "#94A8B2",
  slateDark: "#5C6F78",
  slateSoft: "#E9ECEF",
  slateBorder: "#DCE3E8",

  badgeBg: "#E9ECEF",
  badgeText: "#5A7A72",
  board: "#F0F2F5",
  track: "#E9ECEF",
  trackLine: "#DCE3E8",
  text: "#2A3531",
  mutedText: "#6B7C75",
} as const;

export const chartBarCycle = [
  portalColors.amber,
  portalColors.lavender,
  portalColors.mint,
  portalColors.teal,
  portalColors.coral,
] as const;

export const chartSemantic = {
  completed: portalColors.teal,
  booked: portalColors.mint,
  planning: portalColors.amber,
  upcoming: portalColors.amber,
  active: portalColors.lavender,
  followUp: portalColors.coral,
  pending: portalColors.slate,
  open: portalColors.lavender,
  ongoing: portalColors.coral,
} as const;
