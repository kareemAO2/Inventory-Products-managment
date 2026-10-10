import { AuthBrandingPanel } from '../components/AuthBrandingPanel'
import { LoginForm } from '../components/LoginForm'

export function AuthPage() {
  return (
    <main className="min-h-screen bg-[#eef3f8] bg-[radial-gradient(ellipse_at_12%_90%,rgba(169,205,229,0.23),transparent_38%)] p-8 grid place-items-center max-[850px]:p-5 max-[650px]:block max-[650px]:p-0 max-[650px]:bg-white">
      <section
        className="grid grid-cols-2 w-[min(1120px,100%)] min-h-[min(720px,calc(100vh-64px))] overflow-hidden border border-[rgba(215,226,236,0.9)] rounded-[20px] bg-white shadow-[0_32px_80px_rgba(31,59,87,0.11),0_4px_16px_rgba(31,59,87,0.04)] max-[850px]:grid-cols-[0.9fr_1.1fr] max-[850px]:min-h-[min(700px,calc(100vh-40px))] max-[650px]:flex max-[650px]:flex-col max-[650px]:min-h-screen max-[650px]:border-0 max-[650px]:rounded-none max-[650px]:shadow-none"
        aria-label="Sign in to Northstar"
      >
        <AuthBrandingPanel />
        <LoginForm />
      </section>
    </main>
  )
}
