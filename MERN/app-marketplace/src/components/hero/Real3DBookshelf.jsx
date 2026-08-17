import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, RoundedBox, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ACCENTS = ['#e9c878', '#a9d0b8', '#ee9d83', '#9fb8e8', '#c7a8e8'];
const price = (v) => v === undefined || v === null || v === '' ? '' : `₹${Number(v).toLocaleString('en-IN')}`;
const accentFor = (p) => p.accent || ACCENTS[(p._id || p.id || p.name || '').length % ACCENTS.length];

function Artwork({ product, accent, light }) {
  if (typeof product.art === 'string' && /^(https?:\/\/|data:image\/)/i.test(product.art)) {
    const texture = useTexture(product.art);
    useEffect(() => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; texture.needsUpdate = true; }, [texture]);
    return <mesh position={[0, .42, .38]}><planeGeometry args={[1.9, 1.7]} /><meshBasicMaterial map={texture} /></mesh>;
  }
  return <group position={[0, .42, .38]}><mesh><circleGeometry args={[.36, 48]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.12} metalness={.2} roughness={.3} /></mesh><Text position={[0,0,.025]} fontSize={.25} color={light ? '#302b24' : '#090d12'} anchorX="center" anchorY="middle" fontWeight="bold">{product.initials || 'APP'}</Text></group>;
}

function AppCase({ product, slot, active, onSelect, light }) {
  const ref = useRef();
  const [hover, setHover] = useState(false);
  const accent = accentFor(product);
  const selected = active || hover;
  const x = [-3.7, 0, 3.7][slot];
  const z = active ? .82 : 0;
  const y = active ? .22 : 0;
  // Keep the light-mode cards deliberately darker than the warm page background for strong visual contrast.
  const frame = light ? '#292825' : '#10161e';
  const inner = light ? '#f3eee5' : '#121820';
  const edge = light ? '#b9aa96' : '#ddd5c6';
  const title = light ? '#28241f' : '#f7f3eb';
  const muted = light ? '#70675d' : '#aeb5bf';
  const quiet = light ? '#82776a' : '#8f98a5';

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
    <RoundedBox args={[2.28, 3.62, .56]} radius={.12} smoothness={6}><meshStandardMaterial color={frame} metalness={.72} roughness={.26} /></RoundedBox>
    <RoundedBox position={[0,0,.3]} args={[2.04,3.34,.06]} radius={.075} smoothness={5}><meshStandardMaterial color={inner} emissive={accent} emissiveIntensity={selected ? .08 : .015} metalness={.18} roughness={.3} /></RoundedBox>
    <mesh position={[0,1.45,.35]}><boxGeometry args={[1.86,.022,.014]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.55} /></mesh>
    <Artwork product={product} accent={accent} light={light} />
    <Text position={[0,-.78,.36]} maxWidth={1.7} fontSize={.27} lineHeight={1.05} color={title} anchorX="center" anchorY="middle" textAlign="center">{product.name || 'Application'}</Text>
    <Text position={[0,-1.15,.36]} maxWidth={1.6} fontSize={.105} color={muted} anchorX="center" anchorY="middle" textAlign="center">{product.tagline || product.category || 'Business application'}</Text>
    <Text position={[0,-1.47,.36]} fontSize={.16} color={accent} anchorX="center" anchorY="middle">{price(product.price)}</Text>
    <Text position={[-.68,1.18,.36]} fontSize={.085} color={quiet} anchorX="center" anchorY="middle">{product.category || 'APP'}</Text>
    <group position={[-1.17,0,0]} rotation={[0,-Math.PI/2,0]}><RoundedBox args={[.46,3.42,.06]} radius={.035} smoothness={3}><meshStandardMaterial color={light ? '#383531' : '#0c1118'} metalness={.55} roughness={.32} /></RoundedBox><Text position={[0,.05,.04]} maxWidth={2.5} fontSize={.135} color={light ? '#f2eadf' : title} anchorX="center" anchorY="middle" rotation={[0,0,Math.PI/2]}>{product.name || 'APP'}</Text></group>
    <group position={[1.17,0,0]}><RoundedBox args={[.15,3.42,.38]} radius={.035} smoothness={3}><meshStandardMaterial color={edge} roughness={.58} /></RoundedBox></group>
  </group>;
}

function Shelf({ width = 11.7, light }) {
  return <group position={[0,-1.82,0]}><RoundedBox args={[width,.3,1.85]} radius={.055} smoothness={5} castShadow receiveShadow><meshStandardMaterial color={light ? '#b9a58e' : '#0c0d10'} metalness={light ? .48 : .86} roughness={light ? .38 : .22} /></RoundedBox><RoundedBox position={[0,-.25,-.12]} args={[width-.24,.13,1.52]} radius={.035}><meshStandardMaterial color={light ? '#806b58' : '#38261a'} roughness={.58} /></RoundedBox><mesh position={[0,.18,.7]}><boxGeometry args={[width-.3,.04,.05]} /><meshStandardMaterial color="#e9c878" emissive="#e9c878" emissiveIntensity={.45} /></mesh><mesh position={[0,-.09,.72]}><boxGeometry args={[width-.46,.02,.02]} /><meshStandardMaterial color={light ? '#fff8e8' : '#fff2c7'} emissive="#e9c878" emissiveIntensity={.9} /></mesh></group>;
}

function Scene({ products, activeIndex, setActiveIndex, onSelect, light }) {
  const group = useRef();
  const count = products.length;
  const next = () => setActiveIndex((v) => (v + 1) % count);
  const previous = () => setActiveIndex((v) => (v - 1 + count) % count);

  useEffect(() => {
    const key = (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') previous(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [count]);

  useFrame((state, d) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.pointer.x * .035, 2.5, d);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -state.pointer.y * .025, 2.5, d);
  });

  const visible = useMemo(() => count ? [-1, 0, 1].map((offset, slot) => {
    const index = (activeIndex + offset + count) % count;
    return { product: products[index], index, slot };
  }) : [], [products, activeIndex, count]);

  if (!count) return null;
  return <>
    <group ref={group}>{visible.map(({ product, index, slot }) => <AppCase key={`${product._id || product.id || product.name}-${index}`} product={product} slot={slot} active={index === activeIndex} onSelect={onSelect} light={light} />)}<Shelf light={light} /></group>
    <ambientLight intensity={light ? 1.45 : 1.1} /><directionalLight position={[3,6,5]} intensity={light ? 2.5 : 2.2} castShadow /><pointLight position={[-5,2,4]} intensity={light ? 10 : 18} distance={16} color="#e9c878" /><pointLight position={[5,1,2]} intensity={light ? 6 : 10} distance={14} color="#9fb8e8" />
    <Environment preset="studio" />
    <ContactShadows position={[0,-1.95,0]} opacity={light ? .28 : .5} scale={17} blur={2.6} far={8} />
    <group position={[0,-2.43,.4]}><Text fontSize={.14} color={light ? '#5f564c' : '#8f98a5'} anchorX="center" anchorY="middle">3 APPS ON DISPLAY ·  ←  →  BROWSE THE COLLECTION</Text></group>
  </>;
}

export default function Real3DBookshelf({ products = [], onSelect }) {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [light, setLight] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('light'));

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
          <div className="eyebrow text-[#a9d0b8]">Cutting-Edge Apps</div>
          <h1 className="display mt-3 text-6xl leading-[.88] text-foreground sm:text-7xl xl:text-[5.7rem]">Business apps that <span className="text-[#d3a83f]">work everywhere.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Hybrid apps built for your counter, office, and online customers — connecting everyday operations with digital commerce.</p>
          <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[.16em] text-muted-foreground"><span className="h-px w-10 bg-[#d3a83f]" /> Built for local + online business</div>
        </div>
        <div className="relative -mt-1 h-[470px] w-full sm:h-[530px] lg:-mt-2 lg:h-[590px]">
          <Canvas camera={{ position: [0, .65, 15.4], fov: 38 }} shadows dpr={[1, 1.7]}>
            <Suspense fallback={null}><Scene products={safeProducts} activeIndex={activeIndex} setActiveIndex={setActiveIndex} onSelect={onSelect} light={light} /></Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  </section>;
}
