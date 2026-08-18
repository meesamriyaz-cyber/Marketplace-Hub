import { Star } from 'lucide-react';

export default function Rating({ value = 0, reviews = 0 }) {
  return <span className="flex items-center gap-1.5 text-[12px] text-neutral-400"><Star className="size-3.5 fill-[#e9c878] text-[#e9c878]" /><span>{Number(value).toFixed(1)}</span><span className="text-neutral-500">({reviews})</span></span>;
}
