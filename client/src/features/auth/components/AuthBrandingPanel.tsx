import { BrandMark } from './BrandMark'

export function AuthBrandingPanel() {
  return (
    <aside className="relative flex flex-col overflow-hidden min-h-[620px] px-[52px] pt-[44px] pb-[34px] text-[#f4f9fe] bg-[radial-gradient(ellipse_at_78%_19%,rgba(30,115,155,0.28),transparent_35%),radial-gradient(ellipse_at_18%_85%,rgba(23,81,123,0.34),transparent_45%),linear-gradient(145deg,#102940_2%,#10263e_48%,#0c2036_100%)] before:content-[''] before:absolute before:z-0 before:w-[360px] before:h-[360px] before:border before:border-[rgba(132,192,221,0.09)] before:rounded-full before:pointer-events-none before:top-[164px] before:-right-[172px] before:shadow-[0_0_0_34px_rgba(132,192,221,0.025),0_0_0_68px_rgba(132,192,221,0.025)] after:content-[''] after:absolute after:z-0 after:w-[300px] after:h-[300px] after:border after:border-[rgba(132,192,221,0.09)] after:rounded-full after:pointer-events-none after:right-[40px] after:-bottom-[245px] max-[850px]:px-[34px] max-[850px]:pt-[36px] max-[850px]:pb-[28px] max-[650px]:hidden">
      <div className="relative z-10 inline-flex items-center gap-[12px] text-[#f4f8fc] font-manrope text-[18px] font-extrabold tracking-[-0.7px]">
        <BrandMark />
        <span>northstar</span>
      </div>

      <div className="relative z-10 mt-auto pt-[54px] pb-[44px]">
        <p className="m-0 text-[#78b9d4] text-[10px] font-bold tracking-[1.75px]">
          YOUR OPERATIONS, IN FOCUS
        </p>
        <h1 className="mt-[18px] mb-[17px] text-[#f6f9fc] font-manrope text-[clamp(38px,4vw,50px)] max-[850px]:text-[40px] font-semibold tracking-[-2.6px] leading-[1.13]">
          Clarity for
          <br />
          every move.
        </h1>
        <p className="max-w-[354px] m-0 text-[#a9bdce] text-[14px] leading-[1.8]">
          A calmer way to keep your inventory, orders, and team moving together.
        </p>
      </div>

      <div
        className="relative z-10 w-[min(100%,390px)] mb-[38px] px-[19px] pt-[17px] pb-[15px] border border-[rgba(176,209,231,0.16)] rounded-[12px] bg-[linear-gradient(110deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] shadow-[0_18px_44px_rgba(4,17,31,0.17)] backdrop-blur-[10px]"
        aria-hidden="true"
      >
        <div className="flex items-center gap-[8px] text-[#adc2d2] text-[9px] font-bold tracking-[1.15px]">
          <span className="w-[6px] h-[6px] rounded-full bg-[#5dd4c2] shadow-[0_0_10px_rgba(93,212,194,0.6)]" />
          <span>WORKSPACE STATUS</span>
          <span className="ml-auto text-[#70d8c4] text-[8px]">LIVE</span>
        </div>

        <div className="flex h-[60px] items-end justify-between gap-[6px] my-[19px] mx-0 px-[2px] border-b border-[rgba(181,212,231,0.12)]">
          {[
            'h-[28%]',
            'h-[42%]',
            'h-[33%]',
            'h-[62%]',
            'h-[50%]',
            'h-[74%]',
            'h-[57%]',
            'h-[83%]',
            'h-[68%]',
            'h-[92%]',
            'h-[76%]',
            'h-full',
          ].map((heightClass, index) => (
            <span
              className={`w-[7.2%] rounded-t-[3px] bg-[linear-gradient(180deg,rgba(125,208,224,0.88),rgba(79,150,185,0.28))] ${heightClass}`}
              key={index}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[#c3d3df] text-[11px]">
          <span>Everything in sync</span>
          <span className="grid w-[18px] h-[18px] place-items-center rounded-full text-[#82ddcd] bg-[rgba(84,198,178,0.16)] text-[11px]">
            ✓
          </span>
        </div>
      </div>

      <div className="relative z-10 flex justify-between mt-auto text-[#71889b] text-[8px] font-bold tracking-[1.2px]">
        <span>BUILT FOR THE DETAILS</span>
        <span>01 — 03</span>
      </div>
    </aside>
  )
}
