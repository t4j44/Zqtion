type PortraitId = "orbit" | "spark" | "grid" | "wave";

export const avatarNames: Record<PortraitId, string> = {
  orbit: "Arlo",
  spark: "Sora",
  grid: "Mika",
  wave: "Noor",
};

const palettes: Record<PortraitId, { background: string; halo: string; skin: string; shadow: string; hair: string; clothing: string; detail: string }> = {
  orbit: { background: "#BCDCD6", halo: "#E2F5E7", skin: "#B87C5D", shadow: "#986247", hair: "#1B2E3F", clothing: "#244E62", detail: "#C6F0E4" },
  spark: { background: "#F1CBB9", halo: "#FFE5C2", skin: "#E0AA80", shadow: "#BC8166", hair: "#362337", clothing: "#AE5D47", detail: "#F9E7C1" },
  grid: { background: "#D7D2F2", halo: "#EDE9FF", skin: "#784934", shadow: "#633B2E", hair: "#20253F", clothing: "#5D5BA4", detail: "#E4DDFC" },
  wave: { background: "#C6DFDB", halo: "#E5F4DF", skin: "#C58E69", shadow: "#A36D55", hair: "#2E303C", clothing: "#486F62", detail: "#FFDAB4" },
};

function Hair({ variant, color }: { variant: PortraitId; color: string }) {
  switch (variant) {
    case "orbit":
      return <>
        <path fill={color} d="M38 55c-7-12-5-29 5-36 10-8 31-8 39 5 6 9 5 19 1 30l-7-11c-7 2-12-1-20-7-4 8-13 12-18 19Z" />
        <path d="M42 34c7-10 16-13 27-10" stroke="#607586" strokeWidth="2.8" strokeLinecap="round" opacity=".6" fill="none" />
      </>;
    case "spark":
      return <>
        <path fill={color} d="M37 54c-11-20-2-41 21-42 20-2 32 17 26 39l-9-8-36 12Z" />
        {[[42,29,11],[55,21,12],[69,22,12],[79,31,11],[40,42,11],[80,44,10]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill={color} />)}
        <path d="M43 26c3-3 6-4 9-4" stroke="#735263" strokeWidth="3" opacity=".55" fill="none" strokeLinecap="round" />
      </>;
    case "grid":
      return <>
        <path fill={color} d="M37 51c-5-21 1-34 16-37 16-6 28 3 31 19l-4 20-6-13c-11 2-23-3-28-8L37 51Z" />
        <path d="M45 24c7-6 17-7 25-2M42 30c6-4 11-5 15-5" stroke="#616B91" strokeWidth="2.6" strokeLinecap="round" opacity=".7" fill="none" />
      </>;
    case "wave":
      return <>
        <path fill={color} d="M35 58c-2-23 4-42 25-43 22 0 29 16 26 39l6 42-18-4-10-57-21 60-17-2 9-35Z" />
        <path fill="#41434D" d="M39 42c2-22 13-29 29-24 9 2 14 10 15 20-11 3-20-1-28-9-4 8-10 12-16 13Z" />
      </>;
  }
}

export default function AvatarArtwork({ variant }: { variant: string }) {
  if (!(variant in palettes)) return null;
  const key = variant as PortraitId;
  const p = palettes[key];
  const isWave = key === "wave";
  return (
    <svg className="cq-avatar-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <rect width="120" height="120" rx="60" fill={p.background} />
      <circle cx="95" cy="28" r="42" fill={p.halo} opacity=".7" />
      <circle cx="21" cy="97" r="27" fill={p.halo} opacity=".55" />
      {isWave ? <path d="M32 56c-3-26 9-44 29-44s31 17 28 45l8 48H24l8-49Z" fill={p.hair} /> : null}
      <path d="M8 120c2-19 16-30 38-33l14 11 14-11c21 3 36 14 38 33H8Z" fill={p.clothing} />
      <path d="M51 81v10l9 9 9-9V81H51Z" fill={p.shadow} />
      <path d="M46 88c4 8 9 13 14 16 6-3 10-8 14-16l8 5-22 27-22-27 8-5Z" fill={p.detail} opacity=".9" />
      <ellipse cx="37" cy="60" rx="5" ry="8" fill={p.shadow} />
      <ellipse cx="83" cy="60" rx="5" ry="8" fill={p.shadow} />
      <ellipse cx="60" cy="57" rx="23" ry="29" fill={p.skin} />
      <path d="M45 62c3-2 7-2 10 0M65 62c3-2 7-2 10 0" stroke={p.hair} strokeWidth="2.1" fill="none" strokeLinecap="round" />
      <circle cx="50.5" cy="64.4" r="1.7" fill={p.hair} />
      <circle cx="69.5" cy="64.4" r="1.7" fill={p.hair} />
      <path d="M59 67l-2 7c2 2 4 2 6 0" stroke={p.shadow} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M53 79c4 3.5 10 3.5 14 0" stroke={key==="grid"?"#E3A9A0":"#8E534D"} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="43" cy="73" r="4.5" fill="#F6A58D" opacity=".22" />
      <circle cx="77" cy="73" r="4.5" fill="#F6A58D" opacity=".22" />
      <Hair variant={key} color={p.hair} />
      {key === "grid" ? <g fill="none" stroke="#D8CFE8" strokeWidth="2.4"><rect x="43" y="57" width="15" height="14" rx="5" /><rect x="62" y="57" width="15" height="14" rx="5" /><path d="M58 62h4M42 61l-4-2M77 61l5-2" /></g> : null}
      {key === "spark" ? <><circle cx="82" cy="73" r="2.5" fill="#FBE7BD"/><circle cx="38" cy="73" r="2.5" fill="#FBE7BD"/></> : null}
      {key === "orbit" ? <path d="M44 94l16 12 16-12" fill="none" stroke="#E0F9EB" strokeWidth="2" opacity=".5" /> : null}
      {key === "wave" ? <path d="M85 87c-2 4-6 7-9 9" stroke="#B0CFBE" strokeWidth="3" strokeLinecap="round" fill="none" /> : null}
    </svg>
  );
}
