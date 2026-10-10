export function SessionLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#eef3f8]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9dbe6] border-t-[#245f83] motion-reduce:animate-none"
        role="status"
        aria-label="Restoring your session"
      />
    </main>
  )
}
