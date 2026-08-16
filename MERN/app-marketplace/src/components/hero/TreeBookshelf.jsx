
// ---------------------------------------------------------------------------
// Geometry helpers — builds tapered, organic "branch" shapes as SVG paths.
// Coordinates live in a fixed 1000 x 800 canvas; the component overlays are
// positioned with matching percentages so art + HTML scale together.
// ---------------------------------------------------------------------------

const CANVAS_W = 1000;
const CANVAS_H = 800;

function taperedPath(x1, y1, x2, y2, w1, w2, bend = 0) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const midX = (x1 + x2) / 2 + nx * len * bend;
  const midY = (y1 + y2) / 2 + ny * len * bend;

  const topStart = { x: x1 + (nx * w1) / 2, y: y1 + (ny * w1) / 2 };
  const topEnd = { x: x2 + (nx * w2) / 2, y: y2 + (ny * w2) / 2 };
  const botStart = { x: x1 - (nx * w1) / 2, y: y1 - (ny * w1) / 2 };
  const botEnd = { x: x2 - (nx * w2) / 2, y: y2 - (ny * w2) / 2 };
  const topMid = { x: midX + (nx * (w1 + w2)) / 4, y: midY + (ny * (w1 + w2)) / 4 };
  const botMid = { x: midX - (nx * (w1 + w2)) / 4, y: midY - (ny * (w1 + w2)) / 4 };

  return `M ${topStart.x.toFixed(1)} ${topStart.y.toFixed(1)} Q ${topMid.x.toFixed(1)} ${topMid.y.toFixed(1)} ${topEnd.x.toFixed(1)} ${topEnd.y.toFixed(1)} L ${botEnd.x.toFixed(1)} ${botEnd.y.toFixed(1)} Q ${botMid.x.toFixed(1)} ${botMid.y.toFixed(1)} ${botStart.x.toFixed(1)} ${botStart.y.toFixed(1)} Z`;
}

// Trunk: from the ground up to where it forks.
const TRUNK = { x1: 500, y1: 772, x2: 486, y2: 500, w1: 128, w2: 62, bend: -0.05 };
const TRUNK_PATH = taperedPath(TRUNK.x1, TRUNK.y1, TRUNK.x2, TRUNK.y2, TRUNK.w1, TRUNK.w2, TRUNK.bend);

// Branch slots, ordered by visual priority — if fewer products are supplied
// than slots, the lowest-priority slots (end of array) are simply omitted.
const SLOTS = [
  { id: 'top', from: { x: 486, y: 530 }, to: { x: 512, y: 145 }, w1: 46, w2: 20, bend: 0.06, platformW: 170, platformRot: -2, flagship: true, leaf: { dx: 90, dy: -6, color: 'accent-gold', size: 22 } },
  { id: 'upperLeft', from: { x: 470, y: 570 }, to: { x: 232, y: 246 }, w1: 40, w2: 16, bend: -0.18, platformW: 138, platformRot: -6, leaf: { dx: -18, dy: -34, color: 'accent-mint', size: 16 } },
  { id: 'upperRight', from: { x: 500, y: 560 }, to: { x: 768, y: 268 }, w1: 40, w2: 16, bend: 0.2, platformW: 140, platformRot: 5, leaf: { dx: 30, dy: -30, color: 'accent-coral', size: 14 } },
  { id: 'midLeft', from: { x: 452, y: 660 }, to: { x: 156, y: 470 }, w1: 38, w2: 16, bend: -0.22, platformW: 132, platformRot: -4, leaf: { dx: -10, dy: 26, color: 'accent-coral', size: 14 } },
  { id: 'midRight', from: { x: 512, y: 652 }, to: { x: 846, y: 486 }, w1: 38, w2: 16, bend: 0.18, platformW: 136, platformRot: 4, leaf: { dx: 16, dy: 24, color: 'accent-gold', size: 16 } },
  { id: 'lowerLeft', from: { x: 448, y: 750 }, to: { x: 296, y: 640 }, w1: 34, w2: 15, bend: -0.28, platformW: 124, platformRot: -7 },
];

const LEAF_COLORS = {
  'accent-gold': '#e9c878',
  'accent-mint': '#a9d0b8',
  'accent-coral': '#ee9d83',
};

function ProductThumb({ product }) {
  const key = product.name?.toLowerCase();
  return (
    <div className={`product-art tree-card-art ${product.art || 'art-default'}`} style={{ '--product-accent': product.accent }}>
      <div className="art-noise" />
      {key === 'lumen' && <><div className="lumen-orbit orbit-one" /><div className="lumen-orbit orbit-two" /><div className="lumen-core" /></>}
      {key === 'kairo' && <><div className="kairo-sun" /><div className="kairo-line line-one" /><div className="kairo-line line-two" /><div className="kairo-line line-three" /></>}
      {key === 'drift' && <><div className="drift-grid" /><div className="drift-wave wave-one" /><div className="drift-wave wave-two" /><div className="drift-dot" /></>}
      {key === 'arc' && <><div className="arc-ring ring-one" /><div className="arc-ring ring-two" /><div className="arc-spark" /></>}
    </div>
  );
}

export default function TreeBookshelf({ products = [], onSelect }) {
  const slots = SLOTS.map((slot, index) => ({ ...slot, product: products[index] })).filter((slot) => slot.product);

  return (
    <section id="top" className="tree-hero-section pt-14 pb-10 sm:pt-20 sm:pb-16">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-12">
          <div className="w-full lg:w-5/12 lg:max-w-xl lg:flex-shrink-0 mb-6 lg:mb-0">
            <div className="eyebrow text-[#a9d0b8]">On display</div>
            <h1 className="display mt-3 text-6xl leading-[.92] text-foreground sm:text-7xl lg:text-[5.5rem]">
              The apps people actually use.
            </h1>
            <p className="mt-5 text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">
              Discover tools that earn their shelf space.
            </p>
          </div>
          <div className="w-full lg:flex-1">
            <div className="tree-hero">
        <div className="tree-hero-glow" />

        <svg
          className="tree-hero-svg"
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          preserveAspectRatio="xMidYMax meet"
          role="img"
          aria-label="An illustrated wooden tree whose branches hold the featured apps"
        >
          <defs>
            <linearGradient id="woodTrunk" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a3324" />
              <stop offset="45%" stopColor="#2f2015" />
              <stop offset="100%" stopColor="#1a120c" />
            </linearGradient>
            <linearGradient id="woodBranch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5a3f2c" />
              <stop offset="55%" stopColor="#33241a" />
              <stop offset="100%" stopColor="#1c140e" />
            </linearGradient>
            <linearGradient id="platformGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6b4a34" />
              <stop offset="100%" stopColor="#2c1e15" />
            </linearGradient>
            <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          <ellipse cx="500" cy="778" rx="230" ry="18" fill="url(#groundShadow)" />

          {/* root flare */}
          <path d="M 386 772 Q 500 806 614 772 L 596 748 Q 500 768 404 748 Z" fill="url(#woodTrunk)" opacity="0.95" />

          {/* trunk */}
          <path d={TRUNK_PATH} fill="url(#woodTrunk)" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
          <ellipse cx={TRUNK.x2} cy={TRUNK.y2} rx={TRUNK.w2 / 2} ry={TRUNK.w2 * 0.22} fill="url(#woodTrunk)" />
          <path d={TRUNK_PATH} fill="none" stroke="rgba(233,200,120,0.10)" strokeWidth="2" transform="translate(-3,0)" />

          {slots.map((slot) => (
            <path
              key={`branch-${slot.id}`}
              d={taperedPath(slot.from.x, slot.from.y, slot.to.x, slot.to.y, slot.w1, slot.w2, slot.bend)}
              fill="url(#woodBranch)"
              stroke="rgba(0,0,0,0.35)"
              strokeWidth="1.2"
            />
          ))}

          {slots.map((slot) => (
            <g key={`platform-${slot.id}`} transform={`translate(${slot.to.x} ${slot.to.y + 6}) rotate(${slot.platformRot})`}>
              <ellipse rx={slot.platformW / 2} ry={slot.platformW * 0.11} cy="6" fill="rgba(0,0,0,0.4)" />
              <rect x={-slot.platformW / 2} y="-7" width={slot.platformW} height="16" rx="8" fill="url(#platformGrad)" stroke="rgba(233,200,120,0.18)" strokeWidth="1" />
              <rect x={-slot.platformW / 2 + 4} y="-6" width={slot.platformW - 8} height="3" rx="1.5" fill="rgba(255,255,255,0.10)" />
            </g>
          ))}

          {slots.filter((s) => s.leaf).map((slot) => (
            <circle
              key={`leaf-${slot.id}`}
              cx={slot.to.x + slot.leaf.dx}
              cy={slot.to.y + slot.leaf.dy}
              r={slot.leaf.size}
              fill={LEAF_COLORS[slot.leaf.color]}
              opacity="0.16"
            />
          ))}
        </svg>

        <div
          className="tree-plaque"
          style={{ top: `${(742 / CANVAS_H) * 100}%` }}
        >
          <span className="tree-plaque-text">Cutting Edge Apps</span>
        </div>

        {slots.map((slot, index) => {
          const product = slot.product;
          const left = (slot.to.x / CANVAS_W) * 100;
          const top = ((slot.to.y - 2) / CANVAS_H) * 100;
          return (
            <div
              key={product._id || product.id}
              className="tree-slot"
              style={{ left: `${left}%`, top: `${top}%`, animation: `fadeInUp 0.7s ${0.15 + index * 0.12}s ease-out both` }}
            >
              <button
                type="button"
                onClick={() => onSelect?.(product)}
                className={`tree-card animate-pendulum-delay-${index + 1} ${slot.flagship ? 'tree-card-flagship' : ''}`}
                data-testid={`button-tree-product-${product.id || product._id}`}
                aria-label={`View ${product.name} details`}
              >
                {product.badge && <span className="tree-card-badge">{product.badge}</span>}
                <ProductThumb product={product} />
                <div className="tree-card-label">
                  <span className="tree-card-name">{product.name}</span>
                  <span className="tree-card-price">${product.price}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
          </div>
        </div>
      </div>
    </section>
  );
}
