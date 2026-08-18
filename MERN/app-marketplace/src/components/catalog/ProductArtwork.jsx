export default function ProductArtwork({ product }) {
  const key = product.name?.toLowerCase();
  return <div className={`product-art ${product.art || 'art-default'}`} style={{ '--product-accent': product.accent }}>
    <div className="art-noise" />
    {key === 'lumen' && <><div className="lumen-orbit orbit-one" /><div className="lumen-orbit orbit-two" /><div className="lumen-core" /></>}
    {key === 'kairo' && <><div className="kairo-sun" /><div className="kairo-line line-one" /><div className="kairo-line line-two" /><div className="kairo-line line-three" /></>}
    {key === 'drift' && <><div className="drift-grid" /><div className="drift-wave wave-one" /><div className="drift-wave wave-two" /><div className="drift-dot" /></>}
    {key === 'arc' && <><div className="arc-ring ring-one" /><div className="arc-ring ring-two" /><div className="arc-spark" /></>}
    <span className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-[.22em] text-white/60">{product.name} / {product.category}</span>
  </div>;
}
