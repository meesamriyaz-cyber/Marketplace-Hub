import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'We replaced three separate tools with apps we found here. The quality bar is obviously higher than a typical app store.',
    name: 'Priya Nathan',
    role: 'Founder, Studio Nine',
  },
  {
    quote: 'Checkout was quick, support answered a licensing question same-day, and the apps themselves feel genuinely crafted.',
    name: 'Owen Blake',
    role: 'Operations Lead, Fernway',
  },
  {
    quote: 'The kind of marketplace I wish existed for every category. Curated, calm, and nothing feels thrown together.',
    name: 'Sana Iqbal',
    role: 'Product Designer',
  },
];

function initials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function TestimonialsSection() {
  return (
    <section className="section-container pb-24 pt-20">
      <div className="mb-10 flex flex-col justify-between gap-4 border-t border-neutral-800 pt-10 sm:flex-row sm:items-end">
        <div>
          <div className="eyebrow text-[#ee9d83]">Trusted by teams</div>
          <h2 className="display mt-2 text-4xl leading-none text-neutral-100 sm:text-5xl">What customers say</h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            className="testimonial-card"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div>
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-[#e9c878] text-[#e9c878]" />
                ))}
              </div>
              <p className="testimonial-quote">&ldquo;{testimonial.quote}&rdquo;</p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="testimonial-avatar">{initials(testimonial.name)}</div>
              <div>
                <div className="text-sm font-medium text-neutral-200">{testimonial.name}</div>
                <div className="text-xs text-neutral-500">{testimonial.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
