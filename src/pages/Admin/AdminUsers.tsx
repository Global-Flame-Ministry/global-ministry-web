import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, Users, Mail, X, Trash2, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { UserDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';

const ROLES = ['Admin', 'Member', 'YouthMember'];

const roleColor = (role: string) => {
  if (role === 'Admin')       return 'bg-fuchsia-500/20 text-fuchsia-600 border-fuchsia-500/30';
  if (role === 'YouthMember') return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
  return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
};

const AdminUsers = () => {
  const { isDark } = useAdminTheme();

  const t = {
    bg:       isDark ? 'bg-[#0d0d0d] text-white'     : 'bg-slate-50 text-slate-900',
    border:   isDark ? 'border-white/5'               : 'border-slate-200',
    subtext:  isDark ? 'text-zinc-400'                : 'text-slate-500',
    mutedtext:isDark ? 'text-zinc-600'                : 'text-slate-400',
    input: isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-fuchsia-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500',
    rowActive:isDark ? 'bg-fuchsia-500/10 border-fuchsia-500/20' : 'bg-fuchsia-50 border-fuchsia-300',
    rowIdle:  isDark ? 'border-transparent hover:bg-white/4'     : 'border-transparent hover:bg-white',
    card:     isDark ? 'bg-white/4 border-white/5'    : 'bg-white border-slate-200',
    btnGhost: isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
    modal:    isDark ? 'bg-[#161616] border-white/10 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900',
    skeleton: isDark ? 'bg-white/3'                   : 'bg-slate-200',
    avatar:   isDark ? 'bg-fuchsia-600/30 text-fuchsia-300' : 'bg-fuchsia-100 text-fuchsia-700',
  };

  const [users, setUsers]               = useState<UserDto[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState<UserDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [assigningRole, setAssigningRole] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers({ fullName: search || undefined, pageSize: 100 });
      if (res.data.isSuccess && res.data.data) setUsers(res.data.data);
    } catch { toast.error('Failed to load users'); }
    finally { setIsLoading(false); }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAssignRole = async (userId: string, role: string) => {
    setAssigningRole(true);
    try {
      await adminApi.assignRole(userId, role);
      toast.success(`Role updated to ${role}`);
      const res = await adminApi.getUsers({ pageSize: 100 });
      if (res.data.isSuccess && res.data.data) {
        setUsers(res.data.data);
        const updated = res.data.data.find(u => u.id === userId);
        if (updated) setSelected(updated);
      }
    } catch { toast.error('Failed to assign role'); }
    finally { setAssigningRole(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
    finally { setIsDeleting(false); }
  };

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      {/* Header */}
      <div className={`px-8 pt-8 pb-6 border-b ${t.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-2xl font-bold">Users</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{users.length} total</span>
          <button onClick={fetchUsers} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className={`px-8 py-4 border-b ${t.border}`}>
        <div className="relative max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${t.input}`} />
        </div>
      </div>

      <div className="flex h-[calc(100vh-160px)]">
        {/* List */}
        <div className={`flex flex-col border-r ${t.border} transition-all duration-300 ${selected ? 'w-2/5' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => <div key={i} className={`animate-pulse h-16 rounded-xl ${t.skeleton}`} />)}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Users className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
                <p className={`text-sm ${t.subtext}`}>No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <button key={u.id} onClick={() => setSelected(u)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                      selected?.id === u.id ? t.rowActive : t.rowIdle
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${t.avatar}`}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm truncate">{u.fullName}</p>
                          {u.roles.map(r => (
                            <span key={r} className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${roleColor(r)}`}>{r}</span>
                          ))}
                        </div>
                        <p className={`text-xs truncate ${t.subtext}`}>{u.email}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${u.emailConfirmed ? 'bg-emerald-500' : isDark ? 'bg-zinc-600' : 'bg-slate-300'}`}
                        title={u.emailConfirmed ? 'Email confirmed' : 'Email not confirmed'} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`px-8 py-5 border-b ${t.border} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${t.avatar}`}>
                  {selected.firstName?.[0]}{selected.lastName?.[0]}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{selected.fullName}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {selected.roles.map(r => (
                      <span key={r} className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${roleColor(r)}`}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                <X className={`w-4 h-4 ${t.subtext}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {[
                { label: 'Email',           value: selected.email,     icon: <Mail className="w-3.5 h-3.5" /> },
                { label: 'Username',        value: selected.userName,  icon: null },
                { label: 'Module',          value: selected.module ?? '—', icon: null },
                { label: 'Email Confirmed', value: selected.emailConfirmed ? '✓ Confirmed' : '✗ Not confirmed', icon: null },
                { label: 'Member Since',    value: new Date(selected.createdOn).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), icon: null },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-4 border ${t.card}`}>
                  <p className={`text-xs uppercase tracking-widest mb-1 ${t.subtext}`}>{item.label}</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {item.icon && <span className={t.subtext}>{item.icon}</span>}
                    {item.value}
                  </p>
                </div>
              ))}

              {/* Role assignment */}
              <div className={`rounded-xl p-4 border ${t.card}`}>
                <p className={`text-xs uppercase tracking-widest mb-3 flex items-center gap-2 ${t.subtext}`}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Assign Role
                </p>
                <div className="flex gap-2 flex-wrap">
                  {ROLES.map(role => (
                    <button key={role}
                      onClick={() => handleAssignRole(selected.id, role)}
                      disabled={assigningRole || selected.roles.includes(role)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors disabled:cursor-not-allowed ${
                        selected.roles.includes(role)
                          ? `${roleColor(role)} opacity-100 cursor-default`
                          : `${t.btnGhost} ${t.subtext} disabled:opacity-50`
                      }`}>
                      {assigningRole && !selected.roles.includes(role) ? '...' : role}
                    </button>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${t.mutedtext}`}>Assigning a new role replaces the current role.</p>
              </div>
            </div>

            <div className={`px-8 py-5 border-t ${t.border}`}>
              <button onClick={() => setDeleteTarget(selected)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors hover:bg-red-500/20 hover:text-red-500 ${t.btnGhost} ${t.subtext}`}>
                <Trash2 className="w-4 h-4" /> Delete User
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm text-center border ${t.modal}`}>
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Delete user?</h3>
            <p className={`text-sm mb-6 ${t.subtext}`}>
              <span className="font-bold">{deleteTarget.fullName}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className={`flex-1 py-2.5 rounded-lg text-sm transition-colors ${t.btnGhost}`}>Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm font-bold text-white">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;