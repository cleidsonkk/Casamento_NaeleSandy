const iconMap: Array<{ match: RegExp; icon: string }> = [
  { match: /fryer|air/i, icon: "🍟" },
  { match: /panela|cookware|frigideira/i, icon: "🍳" },
  { match: /prato|jantar|faqueiro|taça|copo/i, icon: "🍽️" },
  { match: /cama|edredom|toalha|enxoval/i, icon: "🛏️" },
  { match: /cafeteira|café/i, icon: "☕" },
  { match: /liquidificador|batedeira|sanduicheira|micro-ondas/i, icon: "🍞" },
  { match: /aspirador|organiza/i, icon: "🏠" },
  { match: /lua de mel|viagem/i, icon: "✈️" },
];

function pickIcon(name: string): string {
  for (const item of iconMap) {
    if (item.match.test(name)) return item.icon;
  }
  return "🎁";
}

export function getGiftPlaceholderDataUrl(name: string): string {
  const icon = pickIcon(name);
  const safeName = name.length > 32 ? `${name.slice(0, 29)}...` : name;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8f0df"/>
          <stop offset="100%" stop-color="#ead5a6"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)"/>
      <circle cx="1020" cy="130" r="180" fill="#ffffff55"/>
      <circle cx="180" cy="760" r="220" fill="#ffffff44"/>
      <text x="600" y="370" font-size="140" text-anchor="middle">${icon}</text>
      <text x="600" y="505" fill="#3d2b18" font-size="58" font-family="Georgia, serif" text-anchor="middle">${safeName}</text>
      <text x="600" y="575" fill="#6b4b2b" font-size="28" font-family="Arial, sans-serif" text-anchor="middle">Imagem ilustrativa</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getGiftImageSrc(imageUrl: string | null | undefined, name: string): string {
  if (imageUrl && imageUrl.trim()) return imageUrl;
  return getGiftPlaceholderDataUrl(name);
}
