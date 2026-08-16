import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Float, Html, OrbitControls, RoundedBox, Text } from '@react-three/drei';

const ACCENTS = ['#e9c878', '#a9d0b8', '#ee9d83', '#9fb8e8', '#c7a8e8'];

function formatPrice(value) {
  if (value === undefined || value === null || value === '') return '';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function AppCase({ product, index, active, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const accent = product.accent || ACCENTS[index % ACCENTS.length];
  const selected = active || hovered;

  const position = useMemo(() => {
    const positions = [-5.2, -2.65, 0, 2.65, 5.2];
    return [positions[index] ?? (index - 2) * 2.65, active ? 0.25 : 0, active ? 0.7 : 0];
  }, [index, active]);

  return (
    <Float speed={1.15 + index * 0.08} rotationIntensity={selected ? 0.035 : 0.012} floatIntensity={selected ? 0.12 : 0.045}>
      <group
        position={position}
        scale={selected ? 1.08 : 1}
        rotation={[0, selected ? (index - 2) * -0.035 : (index - 2) * -0.075, 0]}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(event) => { event.stopPropagation(); onSelect?.(product); }}
      >
        <RoundedBox args={[2.05, 3.25, 0.38]} radius={0.12} smoothness={5}>
          <meshStandardMaterial color="#151a22" metalness={0.5} roughness={0.27} />
        </RoundedBox>

        <RoundedBox position={[0, 0.08, 0.205]} args={[1.84, 2.58, 0.035]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color={accent} metalness={0.15} roughness={0.34} emissive={accent} emissiveIntensity={selected ? 0.12 : 0.025} />
        </RoundedBox>

        <Text
          position={[0, 0.64, 0.245]}
          maxWidth={1.45}
          fontSize={0.28}
          lineHeight={1.05}
          color="#0b0f14"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {product.name || 'App'}
        </Text>

        <Text
          position={[0, 0.05, 0.245]}
          maxWidth={1.42}
          fontSize={0.105}
          lineHeight={1.3}
          color="#18202a"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {product.tagline || product.category || 'Business application'}
        </Text>

        <Text
          position={[0, -0.86, 0.245]}
          maxWidth={1.45}
          fontSize={0.14}
          color="#0b0f14"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {formatPrice(product.price)}
        </Text>

        <mesh position={[1.03, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.05, 0.34]} />
          <meshStandardMaterial color="#0b0e13" metalness={0.65} roughness={0.3} />
        </mesh>

        {product.badge && (
          <Html position={[0.68, 1.18, 0.27]} center distanceFactor={7}>
            <div className="pointer-events-none whitespace-nowrap rounded-full border border-white/20 bg-black/70 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-white shadow-lg backdrop-blur-md">
              {product.badge}
            </div>
          </Html>
        )}

        {selected && (
          <Html position={[0, -2.03, 0.2]} center distanceFactor={7}>
            <div className="pointer-events-none whitespace-nowrap rounded-full border border-white/10 bg-[#0b0f14]/90 px-3 py-1.5 text-[10px] text-white shadow-2xl backdrop-blur-md">
              <span className="mr-2 text-[#a9d0b8]">★ {Number(product.rating || 0).toFixed(1)}</span>
              {product.category || 'Application'}
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

function Shelf() {
  return (
    <group position={[0, -2.05, 0]}>
      <RoundedBox args={[16.4, 0.32, 1.55]} radius={0.08} smoothness={5}>
        <meshStandardMaterial color="#15100c" metalness={0.72} roughness={0.25} />
      </RoundedBox>
      <RoundedBox position={[0, -0.22, -0.05]} args={[16.1, 0.14, 1.25]} radius={0.04} smoothness={3}>
        <meshStandardMaterial color="#4a3324" metalness={0.18} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.2, 0.45]}>
        <boxGeometry args={[16.1, 0.025, 0.05]} />
        <meshStandardMaterial color="#e9c878" emissive="#e9c878" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function Scene({ products, activeIndex, setActiveIndex, onSelect }) {
  const visibleProducts = products.slice(0, 5);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-5, 7, 7]} intensity={2.3} castShadow />
      <pointLight position={[0, 1.5, 5]} intensity={2.1} color="#9fb8e8" distance={12} />
      <pointLight position={[-5, -1, 2]} intensity={1.25} color="#e9c878" distance={10} />

      <group position={[0, 0.2, 0]}>
        {visibleProducts.map((product, index) => (
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
      </group>

      <Shelf />
      <ContactShadows position={[0, -2.32, 0]} opacity={0.55} scale={18} blur={2.5} far={5} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minAzimuthAngle={-0.22}
        maxAzimuthAngle={0.22}
        minPolarAngle={Math.PI / 2.35}
        maxPolarAngle={Math.PI / 2.05}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

export default function Real3DBookshelf({ products = [], onSelect }) {
  const [activeIndex, setActiveIndex] = useState(2);
  const visibleProducts = products.slice(0, 5);

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(159,184,232,.12),transparent_34%),radial-gradient(circle_at_18%_60%,rgba(233,200,120,.07),transparent_28%)]" />
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8">
        <div className="grid items-center gap-4 lg:grid-cols-[.8fr_1.8fr] lg:gap-2">
          <div className="relative z-10 max-w-xl pb-2 lg:pl-4">
            <div className="eyebrow text-[#a9d0b8]">On display · bestselling apps</div>
            <h1 className="display mt-4 text-5xl leading-[.9] text-white sm:text-7xl lg:text-[5.6rem]">The apps people actually use.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-neutral-400 sm:text-lg">Discover business tools that earn their shelf space.</p>
            <div className="mt-7 flex items-center gap-3 text-[11px] uppercase tracking-[.14em] text-neutral-500">
              <span className="size-1.5 rounded-full bg-[#e9c878] shadow-[0_0_14px_#e9c878]" />
              Move around the shelf · click an app to explore
            </div>
          </div>

          <div className="relative h-[470px] w-full sm:h-[560px] lg:h-[610px]">
            <Canvas
              shadows
              dpr={[1, 1.65]}
              camera={{ position: [0, 0.2, 15], fov: 31 }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <Suspense fallback={null}>
                <Scene products={visibleProducts} activeIndex={Math.min(activeIndex, visibleProducts.length - 1)} setActiveIndex={setActiveIndex} onSelect={onSelect} />
              </Suspense>
            </Canvas>
          </div>
        </div>

        <div className="relative mt-2 flex items-center justify-center gap-2">
          {visibleProducts.map((product, index) => (
            <button
              key={product._id || product.id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Focus ${product.name}`}
              className={`h-1 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-[#e9c878]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
