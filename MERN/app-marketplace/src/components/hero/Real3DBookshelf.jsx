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
  if (!isImage) {
    return (
      <group position={[0, 0.02, 0.235]}>
        <Text position={[0, 0.32, 0]} maxWidth={1.45} fontSize={0.58} color="#10151c" anchorX="center" anchorY="middle" fontWeight="bold">
          {product.initials || 'APP'}
        </Text>
        <mesh position={[0, -0.43, -0.01]}>
          <circleGeometry args={[0.22, 32]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      </group>
    );
  }

  return <TexturedArtwork url={art} active={active} />;
}

function TexturedArtwork({ url, active }) {
  const texture = useTexture(url);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh position={[0, 0.08, 0.235]} scale={[1, 1.38, 1]}>
      <planeGeometry args={[1.76, 1.86]} />
      <meshBasicMaterial map={texture} transparent opacity={active ? 1 : 0.94} />
    </mesh>
  );
}

function BookPages() {
  return (
    <group position={[0.99, 0, 0]}>
      <RoundedBox args={[0.12, 3.05, 0.34]} radius={0.035} smoothness={3}>
        <meshStandardMaterial color="#d8d0c1" metalness={0.04} roughness={0.62} />
      </RoundedBox>
      {[0.12, 0.02, -0.08].map((x) => (
        <mesh key={x} position={[x, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.035, 2.82, 0.018]} />
          <meshStandardMaterial color="#b9ae9c" roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function AppCase({ product, index, active, onSelect }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const accent = product.accent || ACCENTS[index % ACCENTS.length];
  const selected = active || hovered;
  const targetX = [-4.85, -2.42, 0, 2.42, 4.85][index] ?? (index - 2) * 2.42;
  const targetZ = active ? 0.85 : index === 2 ? 0.15 : 0;
  const targetY = active ? 0.34 : 0;

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 5, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 5, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, targetZ, 5, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, selected ? (index - 2) * -0.035 : (index - 2) * -0.09, 5, delta);
    const scale = selected ? 1.08 : 1;
    group.current.scale.x = THREE.MathUtils.damp(group.current.scale.x, scale, 6, delta);
    group.current.scale.y = THREE.MathUtils.damp(group.current.scale.y, scale, 6, delta);
    group.current.scale.z = THREE.MathUtils.damp(group.current.scale.z, scale, 6, delta);
  });

  return (
    <group
      ref={group}
      position={[targetX, targetY, targetZ]}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }}
      onClick={(event) => { event.stopPropagation(); onSelect?.(product); }}
      castShadow
      receiveShadow
    >
      <RoundedBox args={[2.0, 3.2, 0.48]} radius={0.11} smoothness={6}>
        <meshStandardMaterial color="#11161e" metalness={0.72} roughness={0.24} />
      </RoundedBox>

      <RoundedBox position={[0, 0.02, 0.265]} args={[1.78, 2.94, 0.06]} radius={0.075} smoothness={5}>
        <meshStandardMaterial color={accent} metalness={0.08} roughness={0.32} emissive={accent} emissiveIntensity={selected ? 0.14 : 0.025} />
      </RoundedBox>

      <CoverArtwork product={product} accent={accent} active={selected} />

      <RoundedBox position={[-0.86, 0, 0.28]} args={[0.045, 2.86, 0.035]} radius={0.012} smoothness={2}>
        <meshStandardMaterial color="#f0eadf" roughness={0.45} />
      </RoundedBox>
      <BookPages />

      <Text position={[0, -1.05, 0.31]} maxWidth={1.42} fontSize={0.16} color="#f5f0e8" anchorX="center" anchorY="middle" textAlign="center">
        {product.name || 'App'}
      </Text>
      <Text position={[0, -1.29, 0.31]} maxWidth={1.35} fontSize={0.11} color="#d6d1c9" anchorX="center" anchorY="middle" textAlign="center">
        {product.tagline || product.category || 'Business application'}
      </Text>
      <Text position={[0, -1.48, 0.31]} fontSize={0.12} color={accent} anchorX="center" anchorY="middle">
        {formatPrice(product.price)}
      </Text>

      <group position={[0, 1.43, 0.33]}>
        <mesh>
          <boxGeometry args={[1.25, 0.045, 0.025]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
        </mesh>
      </group>

      {product.badge && (
        <Html position={[0.56, 1.18, 0.4]} center distanceFactor={6}>
          <div className="pointer-events-none whitespace-nowrap rounded-full border border-white/15 bg-black/75 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.15em] text-white shadow-xl backdrop-blur-md">
            {product.badge}
          </div>
        </Html>
      )}

      {selected && (
        <Html position={[0, -2.0, 0.35]} center distanceFactor={6}>
          <div className="pointer-events-none whitespace-nowrap rounded-full border border-white/10 bg-[#090d13]/95 px-3 py-1.5 text-[10px] text-white shadow-2xl backdrop-blur-md">
            <span className="mr-2 text-[#e9c878]">★ {Number(product.rating || 0).toFixed(1)}</span>
            {product.category || 'Application'}
          </div>
        </Html>
      )}
    </group>
  );
}

function Shelf({ width = 15.8 }) {
  return (
    <group position={[0, -2.0, 0]}>
      <RoundedBox args={[width, 0.28, 1.75]} radius={0.055} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial color="#0c0d10" metalness={0.86} roughness={0.22} />
      </RoundedBox>
      <RoundedBox position={[0, -0.24, -0.12]} args={[width - 0.22, 0.12, 1.42]} radius={0.035} smoothness={3}>
        <meshStandardMaterial color="#38261a" metalness={0.18} roughness={0.58} />
      </RoundedBox>
      <mesh position={[0, 0.17, 0.67]}>
        <boxGeometry args={[width - 0.28, 0.035, 0.045]} />
        <meshStandardMaterial color="#e9c878" emissive="#e9c878" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, -0.08, 0.69]}>
        <boxGeometry args={[width - 0.45, 0.018, 0.018]} />
        <meshStandardMaterial color="#fff2c7" emissive="#e9c878" emissiveIntensity={0.9} />
      </mesh>
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
    const targetY = state.pointer.y * 0.035;
    const targetX = state.pointer.x * 0.045;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetX, 2.5, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -targetY, 2.5, delta);
  });

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
        {products.map((product, index) => (
          <AppCase
            key={product._id || product.id || `${product.name}-${index}`}
            product={product}
            index={index}
            active={index === activeIndex}
            onSelect={(selectedProduct) => {
              setActiveIndex(index);
              onSelect?.(selectedProduct);
            }}
          />
        ))}
        <Shelf />
      </group>

      <ContactShadows position={[0, -2.3, 0]} opacity={0.58} scale={17} blur={2.8} far={5} />
      <Environment preset="city" environmentIntensity={0.25} />

      {count > 1 && (
        <>
          <Html position={[-7.25, -0.9, 0]} center>
            <button type="button" onClick={previous} aria-label="Previous apps" className="pointer-events-auto grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-xl text-white/70 shadow-2xl backdrop-blur-md transition hover:bg-white/10 hover:text-white">‹</button>
          </Html>
          <Html position={[7.25, -0.9, 0]} center>
            <button type="button" onClick={next} aria-label="Next apps" className="pointer-events-auto grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-xl text-white/70 shadow-2xl backdrop-blur-md transition hover:bg-white/10 hover:text-white">›</button>
          </Html>
        </>
      )}
    </>
  );
}

export default function Real3DBookshelf({ products = [], onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleProducts = useMemo(() => products.slice(0, 5), [products]);
  const safeIndex = Math.min(activeIndex, Math.max(visibleProducts.length - 1, 0));

  if (!visibleProducts.length) {
    return (
      <section className="relative overflow-hidden border-b border-white/5 bg-[#070a0f] py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="eyebrow text-[#a9d0b8]">On display</div>
          <h1 className="display mt-4 text-5xl text-white sm:text-7xl">The apps people actually use.</h1>
          <p className="mx-auto mt-5 max-w-xl text-neutral-400">Discover tools that earn their shelf space.</p>
        </div>
      </section>
    );
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
            <p className="mt-6 max-w-md text-base leading-7 text-neutral-400 sm:text-lg">Discover business tools that earn their shelf space.</p>
            <div className="mt-7 flex items-center gap-3 text-[10px] uppercase tracking-[.16em] text-neutral-500">
              <span className="size-1.5 rounded-full bg-[#e9c878] shadow-[0_0_14px_#e9c878]" />
              Hover · drag · explore
            </div>
          </div>

          <div className="relative h-[475px] w-full sm:h-[565px] lg:h-[625px]">
            <Canvas
              shadows
              dpr={[1, 1.7]}
              camera={{ position: [0, 0.2, 15], fov: 30 }}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace;
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.05;
              }}
            >
              <Suspense fallback={null}>
                <Scene products={visibleProducts} activeIndex={safeIndex} setActiveIndex={setActiveIndex} onSelect={onSelect} />
              </Suspense>
            </Canvas>
          </div>
        </div>

        <div className="relative mt-1 flex items-center justify-center gap-2">
          {visibleProducts.map((product, index) => (
            <button
              key={product._id || product.id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Focus ${product.name}`}
              className={`h-1 rounded-full transition-all duration-300 ${index === safeIndex ? 'w-8 bg-[#e9c878]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
