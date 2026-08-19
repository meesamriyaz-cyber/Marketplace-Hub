import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Edit3, KeyRound, Search, ShieldCheck, Users, X } from 'lucide-react';
import { api } from '@/services/api';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', isActive: true });
  const [saveError, setSaveError] = useState('');
  const [resetError, setResetError] = useState('');

  const { data: users = [], isLoading, error } = useQuery({ queryKey: ['admin-users'], queryFn: api.admin.users });
  const { data: currentUser } = useQuery({ queryKey: ['current-user'], queryFn: api.auth.me });

  const visibleUsers = useMemo(() => users.filter((user) => {
    const text = `${user.name || ''} ${user.email || ''}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive !== false : user.isActive === false);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  }), [users, search, statusFilter, roleFilter]);

  const openEdit = (user) => {
    setEditing(user); setSaveError('');
    setForm({ name: user.name || '', email: user.email || '', role: user.role || 'user', isActive: user.isActive !== false });
  };
  const closeEdit = () => { setEditing(null); setSaveError(''); };
  const isSelf = editing && currentUser && (editing._id === currentUser._id || editing.email === currentUser.email);
  const isSoleAdmin = isSelf && editing.role !== 'user' && users.filter((user) => user.role !== 'user' && user.isActive !== false).length <= 1;

  const update = useMutation({
    mutationFn: () => api.admin.updateUser(editing._id, { ...form, ...(isSoleAdmin ? { role: editing.role, isActive: true } : {}) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); queryClient.invalidateQueries({ queryKey: ['current-user'] }); closeEdit(); },
    onError: (e) => setSaveError(e.message || 'Could not update user.'),
  });

  const reset = useMutation({
    mutationFn: () => api.admin.resetUserPassword(resetting._id),
    onSuccess: (data) => { setTemporaryPassword(data.temporaryPassword || ''); setResetError(''); setCopied(false); },
    onError: (e) => setResetError(e.message || 'Could not reset password.'),
  });

  const openReset = (user) => { setResetting(user); setTemporaryPassword(''); setResetError(''); setCopied(false); };
  const closeReset = () => { setResetting(null); setTemporaryPassword(''); setResetError(''); setCopied(false); };
  const copyPassword = async () => { if (!temporaryPassword) return; await navigator.clipboard.writeText(temporaryPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const targetIsAdmin = resetting && resetting.role !== 'user';
  const actorIsSuperAdmin = currentUser?.role === 'super_admin';
  const canReset = !targetIsAdmin || actorIsSuperAdmin;

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3"><Users className="size-5 text-[#e9c878]" /><div><div className="eyebrow">Administration</div><h1 className="display mt-1 text-4xl">Users</h1><p className="mt-2 text-sm text-muted-foreground">Manage accounts, roles and access status.</p></div></div>
      <div className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">{visibleUsers.length} of {users.length} users</div>
    </div>
    {error && <div className="mt-6 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-4 text-sm">{error.message}</div>}
    <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto_auto]"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…" className="input-field w-full pl-10" /></div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field"><option value="all">All roles</option><option value="user">User</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select></div>
    <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-surface"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-[.1em] text-muted-foreground"><tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody>
      {isLoading ? <tr><td colSpan="5" className="px-5 py-8 text-muted-foreground">Loading users…</td></tr> : visibleUsers.map((user) => <tr key={user._id} className="border-b border-border last:border-0"><td className="px-5 py-4"><div className="font-medium">{user.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{user.email}</div></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5">{user.role !== 'user' && <ShieldCheck className="size-3.5" />}{user.role}</span></td><td className="px-5 py-4"><span className={user.isActive === false ? 'text-[#ee9d83]' : 'text-emerald-600'}>{user.isActive === false ? 'Inactive' : 'Active'}</span></td><td className="px-5 py-4 text-muted-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => openEdit(user)}><Edit3 className="size-4" /> Edit</button><button type="button" className="btn-ghost" onClick={() => openReset(user)}><KeyRound className="size-4" /> Reset password</button></div></td></tr>)}
      {!isLoading && !visibleUsers.length && <tr><td colSpan="5" className="px-5 py-10 text-center text-muted-foreground">No users match your filters.</td></tr>}
    </tbody></table></div></div>

    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl"><div className="flex items-center justify-between"><div><div className="eyebrow">Account administration</div><h2 className="display text-2xl">Edit user</h2></div><button type="button" onClick={closeEdit} className="btn-ghost"><X className="size-5" /></button></div>{isSoleAdmin && <div className="mt-5 rounded-2xl border border-[#e9c878]/30 bg-[#e9c878]/10 p-3 text-sm">You are the only active administrator. Your admin role and active status cannot be removed here.</div>}{saveError && <div className="mt-5 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-3 text-sm">{saveError}</div>}<div className="mt-6 grid gap-4"><label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-[.1em] text-muted-foreground">Name</span><input className="input-field w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-[.1em] text-muted-foreground">Email</span><input className="input-field w-full" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-[.1em] text-muted-foreground">Role</span><select className="input-field w-full" value={form.role} disabled={isSoleAdmin} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="user">User</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} disabled={isSoleAdmin} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active account</label></div><button type="button" disabled={update.isPending} onClick={() => update.mutate()} className="btn-primary mt-6 w-full">{update.isPending ? 'Saving…' : 'Save changes'}</button></div></div>}

    {resetting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl"><div className="flex items-center justify-between"><div><div className="eyebrow">Account security</div><h2 className="display text-2xl">Reset password</h2></div><button type="button" onClick={closeReset} className="btn-ghost"><X className="size-5" /></button></div><p className="mt-4 text-sm text-muted-foreground">This will replace the current password for <strong>{resetting.email}</strong> with a newly generated temporary password.</p>{targetIsAdmin && !actorIsSuperAdmin && <div className="mt-4 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-3 text-sm">Only a Super Admin can reset an administrator password.</div>}{resetError && <div className="mt-4 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-3 text-sm">{resetError}</div>}{temporaryPassword ? <div className="mt-5 rounded-2xl border border-[#e9c878]/30 bg-[#e9c878]/10 p-4"><div className="text-xs font-medium uppercase tracking-[.1em] text-muted-foreground">Temporary password — shown once</div><div className="mt-3 flex items-center gap-2"><code className="min-w-0 flex-1 break-all rounded-xl border border-border bg-background px-3 py-2.5 text-sm">{temporaryPassword}</code><button type="button" className="btn-ghost shrink-0" onClick={copyPassword}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? 'Copied' : 'Copy'}</button></div><p className="mt-3 text-xs text-muted-foreground">Save or securely share this password now. It will not be displayed again after closing this dialog.</p></div> : <button type="button" disabled={reset.isPending || !canReset} onClick={() => reset.mutate()} className="btn-primary mt-6 w-full">{reset.isPending ? 'Generating…' : 'Generate temporary password'}</button>}<button type="button" onClick={closeReset} className="btn-ghost mt-3 w-full">{temporaryPassword ? 'Done' : 'Cancel'}</button></div></div>}
  </div>;
}
