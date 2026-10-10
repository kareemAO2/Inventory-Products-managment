interface BrandMarkProps {
  tone?: 'dark' | 'light'
}

const markStyles = {
  dark: 'border-[rgba(176,223,246,0.42)] bg-[rgba(126,196,231,0.11)]',
  light: 'border-[#c7dce8] bg-[#eaf4f9]',
}

export function BrandMark({ tone = 'dark' }: BrandMarkProps) {
  return (
    <span
      className={`grid w-[30px] h-[30px] shrink-0 grid-cols-2 grid-rows-2 content-center justify-center gap-[3px] border rounded-[9px] shadow-[inset_0_0_12px_rgba(133,197,228,0.1)] -rotate-7 ${markStyles[tone]}`}
      aria-hidden="true"
    >
      <span className="rounded-[2px] bg-[#9adcf1]" />
      <span className="rounded-[2px] bg-[#9adcf1] opacity-[0.64]" />
      <span className="rounded-[2px] bg-[#9adcf1] opacity-[0.64]" />
      <span className="rounded-[2px] bg-[#d8f6fb]" />
    </span>
  )
}
