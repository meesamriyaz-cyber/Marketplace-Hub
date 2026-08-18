import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, RoundedBox, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ACCENTS = ['#f0b429', '#4f9f78', '#e96f52', '#5f86d8', '#9a70c7'];
const price = (v) => v === undefined || v === null || v === '' ? '' : `₹${Number(v).toLocaleString('en-IN')}`;
const accentFor = (p) => p.accent || ACCENTS[(p._id || p.id || p.name || '').length % ACCENTS.length];

function Artwork({ product, accent }) {
  if (typeof product.art === 'string' && /^(https?:\/\/|data:image\/)/i.test(product.art)) {
    const texture = useTexture(product.art);
    useEffect(() => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; texture.needsUpdate = true; }, [texture]);
    return <mesh position={[0, .42, .38]}><planeGeometry args={[1.9, 1.7]} /><meshBasicMaterial map={texture} /></mesh>;
  }
  return <group position={[0, .42, .38]}><mesh><circleGeometry args={[.36, 48]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.18} metalness={.28} roughness={.25} /></mesh><Text position={[0,0,.025]} fontSize={.25} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">{product.initials || 'APP'}</Text></group>;
}

function AppCase({ product, slot, active, onSelect, light }) {
  const ref = useRef();
  const [hover, setHover] = useState(false);
  const accent = accentFor(product);
  const selected = active || hover;
  const x = [-3.7, 0, 3.7][slot];
  const z = active ? .82 : 0;
  const y = active ? .22 : 0;
  const frame = light ? '#27231f' : '#080b10';
  const inner = light ? '#3a342d' : '#10151d';
  const edge = light ? '#d2a64f' : '#e5c36e';
  const title = '#ffffff';
  const muted = light ? '#efe5d8' : '#c7ced8';
  const quiet = light ? '#e7c878' : '#9ea8b6';

  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, x, 5, d);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, y, 5, d);
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, z, 5, d);
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, selected ? (slot - 1) * -.035 : (slot - 1) * -.065, 5, d);
    const s = selected ? 1.07 : 1;
    ref.current.scale.x = THREE.MathUtils.damp(ref.current.scale.x, s, 6, d);
    ref.current.scale.y = THREE.MathUtils.damp(ref.current.scale.y, s, 6, d);
    ref.current.scale.z = THREE.MathUtils.damp(ref.current.scale.z, s, 6, d);
  });

  return <group ref={ref} position={[x, y, z]} onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHover(false); document.body.style.cursor = ''; }} onClick={(e) => { e.stopPropagation(); onSelect?.(product); }} castShadow receiveShadow>
    <RoundedBox args={[2.28, 3.62, .56]} radius={.12} smoothness={6}><meshStandardMaterial color={frame} metalness={.72} roughness={.22} /></RoundedBox>
    <RoundedBox position={[0,0,.3]} args={[2.04,3.34,.06]} radius={.075} smoothness={5}><meshStandardMaterial color={inner} emissive={accent} emissiveIntensity={selected ? .11 : .025} metalness={.2} roughness={.28} /></RoundedBox>
    <mesh position={[0,1.45,.35]}><boxGeometry args={[1.86,.035,.018]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.8} /></mesh>
    <Artwork product={product} accent={accent} />
    <Text position={[0,-.78,.36]} maxWidth={1.7} fontSize={.29} lineHeight={1.05} color={title} anchorX="center" anchorY="middle" textAlign="center">{product.name || 'Application'}</Text>
    <Text position={[0,-1.15,.36]} maxWidth={1.6} fontSize={.11} color={muted} anchorX="center" anchorY="middle" textAlign="center">{product.tagline || product.category || 'Business application'}</Text>
    <Text position={[0,-1.47,.36]} fontSize={.17} color={accent} anchorX="center" anchorY="middle">{price(product.price)}</Text>
    <Text position={[-.68,1.18,.36]} fontSize={.09} color={quiet} anchorX="center" anchorY="middle">{product.category || 'APP'}</Text>
    <group position={[-1.17,0,0]} rotation={[0,-Math.PI/2,0]}><RoundedBox args={[.46,3.42,.06]} radius={.035} smoothness={3}><meshStandardMaterial color={light ? '#332c25' : '#070a0f'} metalness={.6} roughness={.3} /></RoundedBox><Text position={[0,.05,.04]} maxWidth={2.5} fontSize={.14} color={title} anchorX="center" anchorY="middle" rotation={[0,0,Math.PI/2]}>{product.name || 'APP'}</Text></group>
    <group position={[1.17,0,0]}><RoundedBox args={[.15,3.42,.38]} radius={.035} smoothness={3}><meshStandardMaterial color={edge} roughness={.5} metalness={.4} /></RoundedBox></group>
  </group>;
}

function Shelf({ width = 11.7, light }) {
  return <group position={[0,-1.82,0]}><RoundedBox args={[width,.3,1.85]} radius={.055} smoothness={5} castShadow receiveShadow><meshStandardMaterial color={light ? '#9b8269' : '#0c0d10'} metalness={light ? .48 : .86} roughness={light ? .38 : .22} /></RoundedBox><RoundedBox position={[0,-.25,-.12]} args={[width-.24,.13,1.52]} radius={.035}><meshStandardMaterial color={light ? '#634d3b' : '#38261a'} roughness={.58} /></RoundedBox><mesh position={[0,.18,.7]}><boxGeometry args={[width-.3,.04,.05]} /><meshStandardMaterial color="#d9a83f" emissive="#d9a83f" emissiveIntensity={.55} /></mesh><mesh position={[0,-.09,.72]}><boxGeometry args={[width-.46,.02,.02]} /><meshStandardMaterial color={light ? '#fff3cf' : '#fff2c7'} emissive="#d9a83f" emissiveIntensity={1} /></mesh></group>;
}

function Scene({ products, activeIndex, setActiveIndex, onSelect, light }) {
  const group = useRef();
  const count = products.length;
  const next = () => setActiveIndex((v) => (v + 1) % count);
  const previous = () => setActiveIndex((v) => (v - 1 + count) % count);

  useEffect(() => {
    const key = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); previous(); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [count]);

  useFrame((state, d) => {
    if (!group.current) return;
    const elapsed = state.clock.getElapsedTime();
    const intro = THREE.MathUtils.clamp(elapsed / 1.15, 0, 1);
    const eased = 1 - Math.pow(1 - intro, 3);
    const introY = THREE.MathUtils.lerp(-0.72, 0, eased);
    const introScale = THREE.MathUtils.lerp(0.86, 1, eased);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, introY, 7, d);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, introScale, 7, d));
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.pointer.x * .035, 2.5, d);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -state.pointer.y * .025, 2.5, d);
  });

  const visible = useMemo(() => count ? [-1, 0, 1].map((offset, slot) => {
    const index = (activeIndex + offset + count) % count;
    return { product: products[index], index, slot };
  }) : [], [products, activeIndex, count]);

  if (!count) return null;
  return <>
    <group ref={group}><group>{visible.map(({ product, index, slot }) => <AppCase key={`${product._id || product.id || product.name}-${index}`} product={product} slot={slot} active={index === activeIndex} onSelect={onSelect} light={light} />)}<Shelf light={light} /></group></group>
    <ambientLight intensity={light ? 1.45 : 1.1} /><directionalLight position={[3,6,5]} intensity={light ? 2.5 : 2.2} castShadow /><pointLight position={[-5,2,4]} intensity={light ? 10 : 18} distance={16} color="#d9a83f" /><pointLight position={[5,1,2]} intensity={light ? 6 : 10} distance={14} color="#6688c4" />
    <Environment preset="studio" />
    <ContactShadows position={[0,-1.95,0]} opacity={light ? .28 : .5} scale={17} blur={2.6} far={8} />
    <group position={[0,-2.78,.4]}>
      <Text fontSize={.43} color={light ? '#2b2824' : '#f2eee6'} anchorX="center" anchorY="middle" letterSpacing={.04}>BROWSE THE COLLECTION</Text>
    </group>
  </>;
}

export default function Real3DBookshelf({ products = [], onSelect }) {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [light, setLight] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('light'));

  const next = () => setActiveIndex((v) => (v + 1) % safeProducts.length);
  const previous = () => setActiveIndex((v) => (v - 1 + safeProducts.length) % safeProducts.length);

  useEffect(() => { if (activeIndex >= safeProducts.length) setActiveIndex(0); }, [safeProducts.length, activeIndex]);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setLight(root.classList.contains('light')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!safeProducts.length) return <section className="relative flex min-h-[100svh] items-center justify-center bg-background"><div className="text-center text-muted-foreground">Loading the app showroom...</div></section>;

  return <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-background" aria-label="3D app showroom">
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-background to-transparent" />
    <div className="section-container relative z-10 flex w-full items-center py-16 sm:py-20">
      <div className="grid w-full items-center gap-2 lg:grid-cols-[.76fr_1.24fr] lg:gap-4 xl:gap-6">
        <div className="max-w-xl pt-2 lg:pt-0">
          <h1 className="display text-6xl leading-[.88] text-foreground sm:text-7xl xl:text-[5.35rem]">Apps for Small Businesses. <span className="text-[#d3a83f]">Built to Work Everywhere.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Hybrid apps built for your counter, office, and online customers — connecting everyday operations with digital commerce.</p>
          <div className="mt-8 flex items-center gap-3 text-sm font-semibold uppercase tracking-[.12em] text-foreground sm:text-base"><span className="h-px w-10 shrink-0 bg-[#d3a83f]" /> Built for local + online business</div>
        </div>
        <div className="relative -mt-1 h-[470px] w-full sm:h-[530px] lg:-mt-2 lg:h-[590px]">
          <Canvas camera={{ position: [0, .65, 15.4], fov: 38 }} shadows dpr={[1, 1.7]}>
            <Suspense fallback={null}><Scene products={safeProducts} activeIndex={activeIndex} setActiveIndex={setActiveIndex} onSelect={onSelect} light={light} /></Suspense>
          </Canvas>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-4 sm:bottom-1">
            <button type="button" onClick={previous} aria-label="Previous app" className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-[#d3a83f]/45 bg-background/80 text-2xl text-[#d3a83f] shadow-lg backdrop-blur transition hover:-translate-x-1 hover:border-[#d3a83f] hover:bg-[#d3a83f]/10 focus:outline-none focus:ring-2 focus:ring-[#d3a83f]/60">←</button>
            <button type="button" onClick={next} aria-label="Next app" className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-[#d3a83f]/45 bg-background/80 text-2xl text-[#d3a83f] shadow-lg backdrop-blur transition hover:translate-x-1 hover:border-[#d3a83f] hover:bg-[#d3a83f]/10 focus:outline-none focus:ring-2 focus:ring-[#d3a83f]/60">→</button>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
