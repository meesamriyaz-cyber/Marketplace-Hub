import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!values.name.trim() || !values.email.trim() || values.message.trim().length < 10) { toast.error('Please enter your name, email and a few details about your requirement.'); return; }
    setSending(true);
    try { await api.contact.submit(values); setSubmitted(true); setValues({ name: '', email: '', message: '' }); toast.success('Requirements received — we will be in touch soon.'); }
    catch (err) { toast.error(err.message || 'Could not send your message. Please try again.'); }
    finally { setSending(false); }
  };
  if (submitted) return <div className="rounded-[24px] border border-[#7ea890]/30 bg-surface p-10 text-center"><Check className="mx-auto size-10 text-[#a9d0b8]" /><h3 className="display mt-5 text-4xl text-foreground">Got it, thank you.</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Your requirements are in. Someone from our team will reach out soon.</p><button type="button" onClick={() => setSubmitted(false)} className="btn-ghost mt-6">Send another request</button></div>;
  return <form onSubmit={submit} className="rounded-[24px] border border-border bg-surface p-7 shadow-[0_18px_60px_rgba(0,0,0,.16)] sm:p-9"><div className="grid gap-5 sm:grid-cols-2"><div><label className="contact-field-label">Name</label><input value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} className="input-field" placeholder="Your name" /></div><div><label className="contact-field-label">Email</label><input type="email" value={values.email} onChange={e => setValues({ ...values, email: e.target.value })} className="input-field" placeholder="you@company.com" /></div></div><div className="mt-5"><label className="contact-field-label">What do you need?</label><textarea value={values.message} onChange={e => setValues({ ...values, message: e.target.value })} rows={5} className="input-field resize-none" placeholder="Tell us about your business, workflow, or application requirement..." /></div><button type="submit" disabled={sending} className="btn-primary mt-6 w-full sm:w-auto">{sending ? 'Sending...' : 'Send requirements'} <ArrowRight className="size-4" /></button></form>;
}
