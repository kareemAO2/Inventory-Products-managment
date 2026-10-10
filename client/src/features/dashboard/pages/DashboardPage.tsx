import { useAppSelector } from '../../../app/hooks'

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user)
  if (!user) return null

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="text-sm font-semibold text-sky-700">Your workspace</p>
        <h1 className="mt-1 font-manrope text-3xl font-bold tracking-tight text-slate-900">
          Welcome, {user.name}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Here is your account and access information.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white p-6 sm:p-8">
          <div className="grid size-16 place-items-center rounded-2xl bg-sky-800 text-2xl font-bold text-white shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-800">Signed-in account</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{user.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>
          <span className="ml-auto rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-bold capitalize text-sky-900">
            {user.role}
          </span>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Role</p>
            <p className="mt-2 text-lg font-bold text-slate-800">{user.role}</p>
            <p className="mt-1 text-sm text-slate-500">
              Your assigned role determines the tools available in Management.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Access profile</p>
            <p className="mt-2 text-lg font-bold text-slate-800">
              {user.permissions.length} permissions
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Management actions are shown according to your granted permissions.
            </p>
          </div>
        </div>
      </section>

      {user.permissions.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Your access</h2>
              <p className="mt-1 text-sm text-slate-500">Capabilities currently assigned to your account.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {user.permissions.length} total
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {user.permissions.map((permission) => (
              <span
                key={permission}
                className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-900"
              >
                {permission}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
