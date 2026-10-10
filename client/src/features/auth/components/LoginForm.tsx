import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../../app/hooks'
import { useLoginMutation } from '../authApi'
import { setCredentials } from '../authSlice'
import { BrandMark } from './BrandMark'

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = error.data
    if (
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof data.error === 'object' &&
      data.error !== null &&
      'message' in data.error &&
      typeof data.error.message === 'string'
    ) {
      return data.error.message
    }
  }

  return 'We couldn’t sign you in. Check your connection and try again.'
}

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectPath = (
    location.state as { from?: { pathname?: string } } | null
  )?.from?.pathname
  const dispatch = useAppDispatch()
  const [login, { isLoading, error }] = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const result = await login({ email, password }).unwrap()
      dispatch(setCredentials(result))
      navigate(redirectPath || '/dashboard', { replace: true })
    } catch {
      // RTK Query exposes the request error to the form below.
    }
  }

  return (
    <section className="flex flex-col min-w-0 px-[58px] pt-[42px] pb-[30px] bg-[radial-gradient(ellipse_at_92%_3%,rgba(230,241,248,0.48),transparent_34%),#fff] max-[850px]:px-[38px] max-[850px]:pt-[36px] max-[850px]:pb-[26px] max-[650px]:min-h-screen max-[650px]:px-[25px] max-[650px]:pt-[28px] max-[650px]:pb-[23px]">
      <div className="hidden max-[650px]:flex max-[650px]:items-center max-[650px]:gap-[10px] text-[#18334d] font-manrope text-[17px] font-extrabold tracking-[-0.6px]">
        <BrandMark tone="light" />
        <span>northstar</span>
      </div>

      <div className="w-[min(100%,380px)] my-auto mx-auto max-[650px]:my-auto max-[650px]:mx-0 max-[650px]:py-[58px] max-[650px]:px-0">
        <div>
          <p className="m-0 text-[#4c92b5] text-[10px] font-bold tracking-[1.75px]">
            WELCOME BACK
          </p>
          <h2 className="mt-[13px] mb-[9px] text-[#18334d] font-manrope text-[27px] max-[650px]:text-[25px] font-bold tracking-[-1.1px] leading-[1.3]">
            Sign in to your account
          </h2>
          <p className="m-0 text-[#7d8e9d] text-[13px] leading-[1.7]">
            Enter your details to pick up where you left off.
          </p>
        </div>

        <form
          className="flex flex-col mt-[35px] max-[650px]:mt-[31px]"
          onSubmit={handleSubmit}
        >
          <label
            htmlFor="email"
            className="mb-[9px] text-[#29435b] text-[12px] font-bold"
          >
            Work email
          </label>
          <div className="flex items-center min-h-[49px] gap-[11px] px-[13px] border border-[#dce5ec] rounded-[8px] bg-[#fbfdff] transition-colors duration-160 ease-in-out focus-within:border-[#65a9cc] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(91,164,202,0.12)]">
            <svg
              className="w-[17px] h-[17px] shrink-0 fill-none stroke-[#94aaba] stroke-[1.5] stroke-linecap-round stroke-linejoin-round"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <rect x="2.5" y="4" width="15" height="12" rx="2" />
              <path d="m3.5 5 6.5 5 6.5-5" />
            </svg>
            <input
              autoComplete="email"
              className="w-full min-w-0 p-0 border-0 outline-none text-[#203b54] bg-transparent text-[12px] placeholder-[#a9b6c1] focus:outline-none focus-visible:outline-[3px] focus-visible:outline-[#308fd2] focus-visible:outline-offset-[3px]"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="flex items-center justify-between mt-[22px]">
            <label
              htmlFor="password"
              className="mb-[9px] text-[#29435b] text-[12px] font-bold"
            >
              Password
            </label>
            <span className="mb-[9px] text-[#9aa9b6] text-[10px]">
              At least 6 characters
            </span>
          </div>
          <div className="flex items-center min-h-[49px] gap-[11px] px-[13px] border border-[#dce5ec] rounded-[8px] bg-[#fbfdff] transition-colors duration-160 ease-in-out focus-within:border-[#65a9cc] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(91,164,202,0.12)]">
            <svg
              className="w-[17px] h-[17px] shrink-0 fill-none stroke-[#94aaba] stroke-[1.5] stroke-linecap-round stroke-linejoin-round"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <rect x="3.5" y="8.5" width="13" height="9" rx="2" />
              <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5M10 12v2" />
            </svg>
            <input
              autoComplete="current-password"
              className="w-full min-w-0 p-0 border-0 outline-none text-[#203b54] bg-transparent text-[12px] placeholder-[#a9b6c1] focus:outline-none focus-visible:outline-[3px] focus-visible:outline-[#308fd2] focus-visible:outline-offset-[3px]"
              id="password"
              minLength={6}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="shrink-0 p-[5px] border-0 text-[#4c8aab] bg-transparent cursor-pointer text-[10px] font-bold hover:text-[#245f83] focus-visible:outline-[3px] focus-visible:outline-[#308fd2] focus-visible:outline-offset-[3px]"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <p
              className="flex items-start gap-[8px] mt-[17px] mb-0 px-[12px] py-[10px] border border-[#f0d5d5] rounded-[7px] text-[#9e3e48] bg-[#fff8f8] text-[11px] leading-[1.55]"
              role="alert"
            >
              <span
                className="grid w-[15px] h-[15px] shrink-0 place-items-center rounded-full text-white bg-[#c26870] text-[10px] font-bold"
                aria-hidden="true"
              >
                !
              </span>
              {getErrorMessage(error)}
            </p>
          )}

          <button
            className="flex items-center justify-center min-h-[49px] gap-[10px] mt-[29px] border border-[#123852] rounded-[8px] text-[#f8fcff] bg-[linear-gradient(105deg,#153d59,#194c6b)] shadow-[0_5px_12px_rgba(23,66,94,0.16)] cursor-pointer text-[12px] font-bold transition-all duration-160 ease-in-out hover:enabled:-translate-y-[1px] hover:enabled:bg-[linear-gradient(105deg,#1a4a6a,#205e80)] hover:enabled:shadow-[0_8px_16px_rgba(23,66,94,0.22)] disabled:cursor-wait disabled:opacity-[0.78] focus-visible:outline-[3px] focus-visible:outline-[#308fd2] focus-visible:outline-offset-[3px]"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <span
                  className="w-[14px] h-[14px] border-2 border-[rgba(255,255,255,0.35)] border-t-white rounded-full animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <svg
                  className="w-[16px] h-[16px] fill-none stroke-current stroke-[1.6] stroke-linecap-round stroke-linejoin-round"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M4 10h12m-5-5 5 5-5 5" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-[7px] mt-[21px] text-[#97a6b2] text-[10px]">
          <svg
            className="w-[14px] h-[14px] fill-none stroke-[#8fa4b2] stroke-[1.4] stroke-linecap-round stroke-linejoin-round"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <rect x="4" y="8.5" width="12" height="9" rx="2" />
            <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" />
          </svg>
          <span>Protected by your workspace authentication</span>
        </div>
      </div>

      <footer className="flex justify-between text-[#a0adb7] text-[10px] max-[650px]:pt-[18px]">
        <span>© 2026 Northstar</span>
        <a
          className="text-[#5d8ba6] no-underline hover:text-[#245f83] hover:underline focus-visible:outline-[3px] focus-visible:outline-[#308fd2] focus-visible:outline-offset-[3px]"
          href="mailto:support@northstar.example"
        >
          Need help?
        </a>
      </footer>
    </section>
  )
}
