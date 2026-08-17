import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Html, RoundedBox, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ACCENTS = ['#e9c878', '#a9d0b8', '#ee9d83', '#9fb8e8', '#c7a8e8'];
const price = (v) => v === undefined || v === null || v === '' ? '' : `₹${Number(v).toLocaleString('en-IN')}`;
const accentFor = (p) => p.accent || ACCENTS[(p._id || p.id || p.name || '').length % ACCENTS.length];

function Artwork({ product, accent }) {
  if (typeof product.art === 'string' && /^(https?:\/\/|data:image\/)/i.test(product.art)) {
    const texture = useTexture(product.art);
    useEffect(() => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; texture.needsUpdate = true; }, [texture]);
    return <mesh position={[0, .34, .318]}><planeGeometry args={[1.62, 1.52]} /><meshBasicMaterial map={texture} /></mesh>;
  }
  return <group position={[0, .34, .318]}><mesh><circleGeometry args={[.31, 48]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.12} metalness={.2} roughness={.3} /></mesh><Text position={[0,0,.025]} fontSize={.22} color="#090d12" anchorX="center" anchorY="middle" fontWeight="bold">{product.initials || 'APP'}</Text></group>;
}
function AppCase({ product, slot, active, onSelect }) {
  const ref = useRef(); const [hover, setHover] = useState(false); const accent = accentFor(product); const selected = active || hover;
  const x = [-4.85,-2.42,0,2.42,4.85][slot], z = active ? .9 : slot === 2 ? .12 : 0, y = active ? .34 : 0;
  useFrame((_,d)=>{ if(!ref.current)return; ref.current.position.x=THREE.MathUtils.damp(ref.current.position.x,x,5,d); ref.current.position.y=THREE.MathUtils.damp(ref.current.position.y,y,5,d); ref.current.position.z=THREE.MathUtils.damp(ref.current.position.z,z,5,d); ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,selected?(slot-2)*-.035:(slot-2)*-.09,5,d); const s=selected?1.08:1; ref.current.scale.x=THREE.MathUtils.damp(ref.current.scale.x,s,6,d); ref.current.scale.y=THREE.MathUtils.damp(ref.current.scale.y,s,6,d); ref.current.scale.z=THREE.MathUtils.damp(ref.current.scale.z,s,6,d); });
  return <group ref={ref} position={[x,y,z]} onPointerOver={e=>{e.stopPropagation();setHover(true);document.body.style.cursor='pointer'}} onPointerOut={()=>{setHover(false);document.body.style.cursor=''}} onClick={e=>{e.stopPropagation();onSelect?.(product)}} castShadow receiveShadow>
    <RoundedBox args={[2,3.2,.5]} radius={.11} smoothness={6}><meshStandardMaterial color="#10161e" metalness={.76} roughness={.23}/></RoundedBox>
    <RoundedBox position={[0,0,.265]} args={[1.78,2.94,.055]} radius={.075} smoothness={5}><meshStandardMaterial color="#121820" emissive={accent} emissiveIntensity={selected?.08:.015} metalness={.18} roughness={.3}/></RoundedBox>
    <mesh position={[0,1.27,.305]}><boxGeometry args={[1.62,.018,.012]}/><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.55}/></mesh><Artwork product={product} accent={accent}/>
    <Text position={[0,-.69,.32]} maxWidth={1.46} fontSize={.235} lineHeight={1.05} color="#f7f3eb" anchorX="center" anchorY="middle" textAlign="center">{product.name||'Application'}</Text><Text position={[0,-1.03,.32]} maxWidth={1.38} fontSize={.095} color="#aeb5bf" anchorX="center" anchorY="middle" textAlign="center">{product.tagline||product.category||'Business application'}</Text><Text position={[0,-1.31,.32]} fontSize={.14} color={accent} anchorX="center" anchorY="middle">{price(product.price)}</Text><Text position={[-.58,1.03,.32]} fontSize={.075} color="#8f98a5" anchorX="center" anchorY="middle">{product.category||'APP'}</Text>
    <group position={[-1.025,0,0]} rotation={[0,-Math.PI/2,0]}><RoundedBox args={[.42,3.02,.055]} radius={.035} smoothness={3}><meshStandardMaterial color="#0c1118" metalness={.65} roughness={.28}/></RoundedBox><Text position={[0,.05,.038]} maxWidth={2.35} fontSize={.12} color="#f2eee5" anchorX="center" anchorY="middle" rotation={[0,0,Math.PI/2]}>{product.name||'APP'}</Text></group>
    <group position={[1.02,0,0]}><RoundedBox args={[.13,3.02,.34]} radius={.035} smoothness={3}><meshStandardMaterial color="#ddd5c6" roughness={.58}/></RoundedBox></group>
  </group>;
}
function Shelf({width=15.8}) { return <group position={[0,-2,0]}><RoundedBox args={[width,.28,1.75]} radius={.055} smoothness={5} castShadow receiveShadow><meshStandardMaterial color="#0c0d10" metalness={.86} roughness={.22}/></RoundedBox><RoundedBox position={[0,-.24,-.12]} args={[width-.22,.12,1.42]} radius={.035}><meshStandardMaterial color="#38261a" roughness={.58}/></RoundedBox><mesh position={[0,.17,.67]}><boxGeometry args={[width-.28,.035,.045]}/><meshStandardMaterial color="#e9c878" emissive="#e9c878" emissiveIntensity={.45}/></mesh><mesh position={[0,-.08,.69]}><boxGeometry args={[width-.45,.018,.018]}/><meshStandardMaterial color="#fff2c7" emissive="#e9c878" emissiveIntensity={.9}/></mesh></group>; }
function Scene({products,activeIndex,setActiveIndex,onSelect}) {
  const group=useRef(); const count=products.length; const next=()=>setActiveIndex(v=>(v+1)%count); const previous=()=>setActiveIndex(v=>(v-1+count)%count);
  useEffect(()=>{const key=e=>{if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')previous()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[count]);
  useFrame((state,d)=>{if(!group.current)return;group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,state.pointer.x*.045,2.5,d);group.current.rotation.x=THREE.MathUtils.damp(group.current.rotation.x,-state.pointer.y*.035,2.5,d)});
  const visible=useMemo(()=>count?[-2,-1,0,1,2].map((o,slot)=>{const index=(activeIndex+o+count)%count;return{product:products[index],index,slot}}):[],[products,activeIndex,count]);
  if(!count)return null;
  return <><group ref={group}>{visible.map(({product,index,slot})=><AppCase key={`${product._id||product.id||product.name}-${index}`} product={product} slot={slot} active={index===activeIndex} onSelect={onSelect}/>)}<Shelf/></group><ambientLight intensity={1.1}/><directionalLight position={[3,6,5]} intensity={2.2} castShadow/><pointLight position={[-5,2,4]} intensity={18} distance={16} color="#e9c878"/><pointLight position={[5,1,2]} intensity={10} distance={14} color="#9fb8e8"/><Environment preset="studio"/><ContactShadows position={[0,-2.12,0]} opacity={.5} scale={20} blur={2.6} far={8}/><group position={[0,-3.15,.4]}><Text fontSize={.12} color="#8f98a5" anchorX="center" anchorY="middle">{activeIndex+1} / {count} · USE ← → TO BROWSE</Text></group></>;
}
export default function Real3DBookshelf({products=[],onSelect}) {
  const safeProducts=Array.isArray(products)?products.filter(Boolean):[]; const [activeIndex,setActiveIndex]=useState(0);
  useEffect(()=>{if(activeIndex>=safeProducts.length)setActiveIndex(0)},[safeProducts.length,activeIndex]);
  if(!safeProducts.length)return <section className="relative flex min-h-[620px] items-center justify-center bg-[#05080d]"><div className="text-center text-neutral-400">Loading the app showroom...</div></section>;
  return <section className="relative overflow-hidden bg-[#05080d]" aria-label="3D app showroom"><div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[#05080d] to-transparent"/><div className="section-container relative z-10 pt-24 sm:pt-28"><div className="max-w-3xl"><div className="eyebrow text-[#a9d0b8]">Cutting-Edge Apps</div><h1 className="display mt-3 text-6xl leading-[.86] text-white sm:text-8xl">Software, <span className="text-[#e9c878]">shelved beautifully.</span></h1><p className="mt-5 max-w-xl text-sm leading-6 text-neutral-400">Explore our handpicked digital workspace. Click any app cover to see its full presentation.</p></div></div><div className="relative h-[570px] w-full sm:h-[650px]"><Canvas camera={{position:[0,1.1,13.8],fov:38}} shadows dpr={[1,1.7]}><Suspense fallback={null}><Scene products={safeProducts} activeIndex={activeIndex} setActiveIndex={setActiveIndex} onSelect={onSelect}/></Suspense></Canvas></div><div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[.18em] text-neutral-600">Each cover is a live 3D product</div></section>;
}
