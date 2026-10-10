import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { useLogoutMutation } from '../../auth/authApi'
import { clearCredentials } from '../../auth/authSlice'
import { BrandMark } from '../../auth/components/BrandMark'

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: '◫' },
  { label: 'Management', to: '/management', icon: '▤' },
]

export function WorkspaceLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const [logout] = useLogoutMutation()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSignOut() {
    void logout()
    dispatch(clearCredentials())
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-6">
          <BrandMark tone="light" />
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.16em] text-sky-800">
              NORTHSTAR
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Operations</p>
          </div>
        </div>
        <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-6">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </p>
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-sky-50 text-sky-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className="grid size-7 place-items-center rounded-lg bg-white text-base text-sky-800 shadow-sm">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-100 text-sm font-bold text-sky-900">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">{user.name}</p>
              <p className="truncate text-[11px] capitalize text-slate-500">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-lg px-2 py-1 text-slate-500 hover:bg-white hover:text-slate-900"
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandMark tone="light" />
              <span className="text-xs font-extrabold tracking-[0.14em] text-sky-800">NORTHSTAR</span>
            </div>
            <div className="hidden text-xs text-slate-500 lg:block">
              Workspace <span className="mx-2 text-slate-300">/</span>
              <span className="font-semibold text-slate-700">{user.role}</span>
            </div>
            <div className="ml-auto flex items-center gap-3 lg:ml-0">
              <span className="hidden text-sm font-semibold text-slate-700 sm:inline">{user.name}</span>
              <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold capitalize text-sky-800">{user.role}</span>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-label="Toggle workspace navigation"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 lg:hidden"
              >
                Menu
              </button>
            </div>
          </div>
          {menuOpen && (
            <nav aria-label="Main navigation" className="flex gap-2 border-t border-slate-100 px-5 py-3 lg:hidden">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-semibold ${
                      isActive ? 'bg-sky-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleSignOut}
                className="ml-auto rounded-lg px-3 py-2 text-sm font-semibold text-rose-700"
              >
                Sign out
              </button>
            </nav>
          )}
        </header>
        <main className="mx-auto w-full max-w-360 px-5 py-7 sm:px-8 sm:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
