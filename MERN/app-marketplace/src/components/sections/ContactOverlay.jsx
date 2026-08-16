import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowRight, Check, X } from 'lucide-react';
import { api } from '@/services/api';

const contactSchema = z.object({
  name: z.string().min(1, 'Please tell us your name'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(10, 'A few more details would help us respond well'),
});

export default function ContactOverlay({ open, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values) => {
    try {
      await api.contact.submit(values);
      setSubmitted(true);
      reset();
      toast.success('Requirements received — we will be in touch soon.');
    } catch (err) {
      toast.error(err.message || 'Could not send your message. Please try again.');
    }
  };

  if (!open) return null;

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Contact form">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }} className="relative w-full max-w-lg overflow-y-auto rounded-[28px] border border-border-subtle bg-surface p-7 shadow-[0_24px_100px_rgba(0,0,0,.55)] quiet-scrollbar">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-300 hover:bg-white/10" aria-label="Close contact form" data-testid="button-close-contact-overlay">
          <X className="size-4" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border border-[#7ea890] text-[#a9d0b8]">
              <Check className="size-7" />
            </div>
            <h3 className="display mt-6 text-4xl text-neutral-100">Got it, thank you.</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-400">
              Your requirements are in. Someone from our team will reach out at the email you provided.
            </p>
            <button type="button" onClick={() => { setSubmitted(false); onClose(); }} className="btn-ghost mt-7" data-testid="button-contact-another-overlay">
              Send another request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="form-contact-overlay">
            <div className="mb-2">
              <div className="eyebrow text-[#a9d0b8]">Need an app?</div>
              <h2 className="display mt-2 text-3xl leading-[.95] text-neutral-100 sm:text-4xl">Tell us what you need.</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-400">Share a few details and our team will follow up with next steps.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="contact-field-label">Name</label>
                <input type="text" {...register('name')} className="input-field" placeholder="Jordan Lee" data-testid="input-contact-name-overlay" />
                {errors.name && <p className="mt-1.5 text-xs text-[#ee9d83]">{errors.name.message}</p>}
              </div>
              <div>
                <label className="contact-field-label">Email</label>
                <input type="email" {...register('email')} className="input-field" placeholder="you@company.com" data-testid="input-contact-email-overlay" />
                {errors.email && <p className="mt-1.5 text-xs text-[#ee9d83]">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="contact-field-label">What do you need?</label>
              <textarea {...register('message')} rows={5} className="input-field resize-none" placeholder="Tell us about your business and what you're hoping to build or improve..." data-testid="textarea-contact-message-overlay" />
              {errors.message && <p className="mt-1.5 text-xs text-[#ee9d83]">{errors.message.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full" data-testid="button-contact-submit-overlay">
              {isSubmitting ? 'Sending...' : 'Send requirements'} <ArrowRight className="size-4" />
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
