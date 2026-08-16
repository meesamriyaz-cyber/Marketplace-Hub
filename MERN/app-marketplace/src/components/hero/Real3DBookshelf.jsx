import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Html, RoundedBox, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ACCENTS = ['#e9c878', '#a9d0b8', '#ee9d83', '#9fb8e8', '#c7a8e8'];

function formatPrice(value) {
  if (value === undefined || value === null || value === '') return '';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function CoverArtwork({ product, accent, active }) {
  const art = product.art;
  const isImage = typeof art === 'string' && /^(https?:\/\/|data:image\/)/i.test(art);
  if (isImage) return <TexturedArtwork url={art} active={active} />;
  return (
    <group position={[0, 0.34, 0.318]}>
      <mesh>
        <circleGeometry args={[0.31, 48]} />
        <meshStandardMaterial color={accent} metalness={0.2} roughness={0.3} emissive={accent} emissiveIntensity={active ? 0.18 : 0.04} />
      </mesh>
      <Text position={[0, -0.01, 0.025]} fontSize={0.22} color="#0a0d12" anchorX="center" anchorY="middle" fontWeight="bold">
        {product.initials || 'APP'}
      </Text>
    </group>
  );
}

function TexturedArtwork({ url, active }) {
  const texture = useTexture(url);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);
  return (
    <mesh position={[0, 0.35, 0.318]}>
      <planeGeometry args={[1.62, 1.52]} />
      <meshBasicMaterial map={texture} transparent opacity={active ? 1 : 0.96} />
    </mesh>
  );
}

function FrontCover({ product, accent, active }) {
  return (
    <group>
      <RoundedBox position={[0, 0, 0.265]} args={[1.78, 2.94, 0.055]} radius={0.075} smoothness={5}>
        <meshStandardMaterial color="#121820" metalness={0.18} roughness={0.3} emissive={accent} emissiveIntensity={active ? 0.08 : 0.015} />
      </RoundedBox>
      <mesh position={[0, 1.27, 0.305]}>
        <boxGeometry args={[1.62, 0.018, 0.012]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} />
      </mesh>
      <CoverArtwork product={product} accent={accent} active={active} />
      <Text position={[0, -0.69, 0.32]} maxWidth={1.46} fontSize={0.235} lineHeight={1.05} color="#f7f3eb" anchorX="center" anchorY="middle" textAlign="center">
        {product.name || 'Application'}
      </Text>
      <Text position={[0, -1.03, 0.32]} maxWidth={1.38} fontSize={0.095} lineHeight={1.3} color="#aeb5bf" anchorX="center" anchorY="middle" textAlign="center">
        {product.tagline || product.category || 'Business application'}
      </Text>
      <Text position={[0, -1.31, 0.32]} fontSize={0.14} color={accent} anchorX="center" anchorY="middle">
        {formatPrice(product.price)}
      </Text>
      <Text position={[-0.58, 1.03, 0.32]} fontSize={0.075} color="#8f98a5" anchorX="center" anchorY="middle">
        {product.category || 'APP'}
      </Text>
    </group>
  );
}

function Spine({ product, accent }) {
  return (
    <group position={[-1.025, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[0.42, 3.02, 0.055]} radius={0.035} smoothness={3}>
        <meshStandardMaterial color="#0c1118" metalness={0.65} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 1.34, 0.035]}>
        <boxGeometry args={[0.25, 0.022, 0.012]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 0.05, 0.038]} maxWidth={2.35} fontSize={0.12} color="#f2eee5" anchorX="center" anchorY="middle" rotation={[0, 0, Math.PI / 2]} textAlign="center">
        {product.name || 'APP'}
      </Text>
      <Text position={[0, -1.08, 0.038]} fontSize={0.065} color={accent} anchorX="center" anchorY="middle" rotation={[0, 0, Math.PI / 2]}>
        CUTTING-EDGE
      </Text>
    </group>
  );
}

function BackCover({ product, accent }) {
  const features = Array.isArray(product.features) ? product.features.slice(0, 3) : [];
  return (
    <group position={[0, 0, -0.265]} rotation={[0, Math.PI, 0]}>
      <RoundedBox args={[1.78, 2.94, 0.055]} radius={0.075} smoothness={5}>
        <meshStandardMaterial color="#0d131a" metalness={0.2} roughness={0.34} />
      </RoundedBox>
      <Text position={[0, 1.08, 0.035]} maxWidth={1.4} fontSize={0.19} color="#f5f0e8" anchorX="center" anchorY="middle" textAlign="center">
        {product.name || 'Application'}
      </Text>
      <mesh position={[0, 0.84, 0.04]}>
        <boxGeometry args={[1.25, 0.018, 0.012]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.45} />
      </mesh>
      <Text position={[0, 0.55, 0.04]} maxWidth={1.4} fontSize={0.085} lineHeight={1.45} color="#aeb5bf" anchorX="center" anchorY="middle" textAlign="center">
        {product.description || product.tagline || 'A focused business application built to make work simpler.'}
      </Text>
      {features.map((feature, index) => (
        <group key={`${feature}-${index}`} position={[-0.61, 0.02 - index * 0.31, 0.04]}>
          <mesh><circleGeometry args={[0.055, 24]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} /></mesh>
          <Text position={[0.14, 0, 0]} maxWidth={1.05} fontSize={0.075} lineHeight={1.2} color="#d9d5ce" anchorX="left" anchorY="middle">{feature}</Text>
        </group>
      ))}
      <Text position={[0, -1.14, 0.04]} maxWidth={1.3} fontSize={0.075} color="#737c88" anchorX="center" anchorY="middle" textAlign="center">
        {product.category || 'Business software'} · {Number(product.rating || 0).toFixed(1)} ★
      </Text>
    </group>
  );
}

function PageBlock() {
  return (
    <group position={[1.02, 0, 0]}>
      <RoundedBox args={[0.13, 3.02, 0.34]} radius={0.035} smoothness={3}>
        <meshStandardMaterial color="#ddd5c6" metalness={0.03} roughness={0.58} />
      </RoundedBox>
      {[-0.09, 0, 0.09].map((x) => (
        <mesh key={x} position={[x, 0, 0.18]}><boxGeometry args={[0.012, 2.82, 0.02]} /><meshStandardMaterial color="#b9ae9d" roughness={0.72} /></mesh>
      ))}
    </group>
  );
}

function AppCase({ product, slot, active, onSelect }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const accent = product.accent || ACCENTS[(product._id || product.id || product.name || '').length % ACCENTS.length];
  const selected = active || hovered;
  const targetX = [-4.85, -2.42, 0, 2.42, 4.85][slot];
  const targetZ = active ? 0.9 : slot === 2 ? 0.12 : 0;
  const targetY = active ? 0.34 : 0;
  const targetRotation = selected ? (slot - 2) * -0.035 : (slot - 2) * -0.09;

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 5, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 5, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, targetZ, 5, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotation, 5, delta);
    const scale = selected ? 1.08 : 1;
    group.current.scale.x = THREE.MathUtils.damp(group.current.scale.x, scale, 6, delta);
    group.current.scale.y = THREE.MathUtils.damp(group.current.scale.y, scale, 6, delta);
    group.current.scale.z = THREE.MathUtils.damp(group.current.scale.z, scale, 6, delta);
  });

  return (
    <group ref={group} position={[targetX, targetY, targetZ]} onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }} onClick={(event) => { event.stopPropagation(); onSelect?.(product); }} castShadow receiveShadow>
      <RoundedBox args={[2.0, 3.2, 0.5]} radius={0.11} smoothness={6}><meshStandardMaterial color="#10161e" metalness={0.76} roughness={0.23} /></RoundedBox>
      <FrontCover product={product} accent={accent} active={selected} />
      <Spine product={product} accent={accent} />
      <BackCover product={product} accent={accent} />
      <PageBlock />
      <mesh position={[0, 1.54, 0.31]}><boxGeometry args={[1.34, 0.025, 0.025]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} /></mesh>
      {product.badge && <Html position={[0.57, 1.18, 0.39]} center distanceFactor={6}><div className="pointer-events-none whitespace-nowrap rounded-full border border-white/15 bg-black/75 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.15em] text-white shadow-xl backdrop-blur-md">{product.badge}</div></Html>}
      {selected && <Html position={[0, -2.0, 0.35]} center distanceFactor={6}><div className="pointer-events-none whitespace-nowrap rounded-full border border-white/10 bg-[#090d13]/95 px-3 py-1.5 text-[10px] text-white shadow-2xl backdrop-blur-md"><span className="mr-2 text-[#e9c878]">★ {Number(product.rating || 0).toFixed(1)}</span>{product.category || 'Application'}</div></Html>}
    </group>
  );
}

function Shelf({ width = 15.8 }) {
  return (
    <group position={[0, -2.0, 0]}>
      <RoundedBox args={[width, 0.28, 1.75]} radius={0.055} smoothness={5} castShadow receiveShadow><meshStandardMaterial color="#0c0d10" metalness={0.86} roughness={0.22} /></RoundedBox>
      <RoundedBox position={[0, -0.24, -0.12]} args={[width - 0.22, 0.12, 1.42]} radius={0.035} smoothness={3}><meshStandardMaterial color="#38261a" metalness={0.18} roughness={0.58} /></RoundedBox>
      <mesh position={[0, 0.17, 0.67]}><boxGeometry args={[width - 0.28, 0.035, 0.045]} /><meshStandardMaterial color="#e9c878" emissive="#e9c878" emissiveIntensity={0.45} /></mesh>
      <mesh position={[0, -0.08, 0.69]}><boxGeometry args={[width - 0.45, 0.018, 0.018]} /><meshStandardMaterial color="#fff2c7" emissive="#e9c878" emissiveIntensity={0.9} /></mesh>
    </group>
  );
}

function Scene({ products, activeIndex, setActiveIndex, onSelect }) {
  const group = useRef();
  const count = products.length;
  const next = () => setActiveIndex((value) => (value + 1) % count);
  const previous = () => setActiveIndex((value) => (value - 1 + count) % count);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.pointer.x * 0.045, 2.5, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -state.pointer.y * 0.035, 2.5, delta);
  });

  const shelfProducts = useMemo(() => {
    if (!count) return [];
    return [-2, -1, 0, 1, 2].map((offset, slot) => {
      const index = (activeIndex + offset + count) % count;
      return { product: products[index], index, slot };
    });
  }, [products, activeIndex, count]);

  return (
    <>
      <color attach="background" args={['#07090d']} />
      <fog attach="fog" args={['#07090d', 15, 27]} />
      <ambientLight intensity={0.42} />
      <hemisphereLight color="#dce8ff" groundColor="#120e0a" intensity={1.05} />
      <directionalLight position={[-5, 8, 8]} intensity={2.7} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.00015} />
      <spotLight position={[0, 5, 7]} angle={0.45} penumbra={0.8} intensity={18} distance={18} color="#dce8ff" castShadow />
      <pointLight position={[-6, 0, 3]} intensity={2.1} color="#e9c878" distance={12} />
      <pointLight position={[6, 0, 3]} intensity={1.7} color="#9fb8e8" distance={12} />
      <group ref={group} position={[0, 0.15, 0]}>
        {shelfProducts.map(({ product, index, slot }) => (
          <AppCase key={product._id || product.id || `${product.name}-${index}`} product={product} slot={slot} active={index === activeIndex} onSelect={(selectedProduct) => { setActiveIndex(index); onSelect?.(selectedProduct); }} />
        ))}
        <Shelf />
      </group>
      <ContactShadows position={[0, -2.3, 0]} opacity={0.58} scale={17} blur={2.8} far={5} />
      <Environment preset="city" environmentIntensity={0.25} />
      {count > 1 && <>
        <Html position={[-7.25, -0.9, 0]} center><button type="button" onClick={previous} aria-label="Previous apps" className="pointer-events-auto grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-xl text-white/70 shadow-2xl backdrop-blur-md transition hover:bg-white/10 hover:text-white">‹</button></Html>
        <Html position={[7.25, -0.9, 0]} center><button type="button" onClick={next} aria-label="Next apps" className="pointer-events-auto grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-xl text-white/70 shadow-2xl backdrop-blur-md transition hover:bg-white/10 hover:text-white">›</button></Html>
      </>}
    </>
  );
}

export default function Real3DBookshelf({ products = [], onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const allProducts = useMemo(() => products, [products]);
  const safeIndex = Math.min(activeIndex, Math.max(allProducts.length - 1, 0));

  if (!allProducts.length) {
    return <section className="relative overflow-hidden border-b border-white/5 bg-[#070a0f] py-24"><div className="mx-auto max-w-7xl px-6 text-center"><div className="eyebrow text-[#a9d0b8]">On display</div><h1 className="display mt-4 text-5xl text-white sm:text-7xl">The apps people actually use.</h1><p className="mx-auto mt-5 max-w-xl text-neutral-400">Discover tools that earn their shelf space.</p></div></section>;
  }

  return (
    <section id="top" className="relative overflow-hidden border-b border-white/5 bg-[#070a0f] py-14 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_42%,rgba(159,184,232,.13),transparent_30%),radial-gradient(circle_at_18%_65%,rgba(233,200,120,.08),transparent_26%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative mx-auto max-w-[1550px] px-5 sm:px-8">
        <div className="grid items-center gap-2 lg:grid-cols-[.78fr_1.95fr] lg:gap-0">
          <div className="relative z-10 max-w-xl pb-4 lg:pl-5">
            <div className="eyebrow text-[#a9d0b8]">On display · bestselling apps</div>
            <h1 className="display mt-4 text-5xl leading-[.9] text-white sm:text-7xl lg:text-[5.5rem]">The apps people actually use.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-neutral-400 sm:text-lg">Start with our bestsellers, then browse the entire app collection.</p>
            <div className="mt-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-neutral-500"><span className="size-1.5 rounded-full bg-[#e9c878] shadow-[0_0_14px_#e9c878]" />Use arrows · keyboard · click an app</div>
            <div className="mt-5 text-[11px] tracking-[0.08em] text-neutral-600">{safeIndex + 1} / {allProducts.length} apps</div>
          </div>
          <div className="relative h-[475px] w-full sm:h-[565px] lg:h-[625px]">
            <Canvas shadows dpr={[1, 1.7]} camera={{ position: [0, 0.2, 15], fov: 30 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}>
              <Suspense fallback={null}><Scene products={allProducts} activeIndex={safeIndex} setActiveIndex={setActiveIndex} onSelect={onSelect} /></Suspense>
            </Canvas>
          </div>
        </div>
        <div className="relative mt-1 flex items-center justify-center gap-2">
          {allProducts.slice(0, Math.min(allProducts.length, 12)).map((product, index) => (
            <button key={product._id || product.id || index} type="button" onClick={() => setActiveIndex(index)} aria-label={`Open ${product.name}`} className={`h-1 rounded-full transition-all duration-300 ${index === safeIndex ? 'w-8 bg-[#e9c878]' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
          ))}
          {allProducts.length > 12 && <span className="ml-1 text-[9px] uppercase tracking-[0.15em] text-neutral-600">+{allProducts.length - 12}</span>}
        </div>
      </div>
    </section>
  );
}
