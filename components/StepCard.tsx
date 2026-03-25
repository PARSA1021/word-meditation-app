"use client"

interface StepCardProps {
  step: number
  icon: string
  title: string
  desc: string
  compact?: boolean
}

export default function StepCard({ step, icon, title, desc, compact = false }: StepCardProps) {
  if (compact) {
    return (
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
        <div className="absolute -right-1 -bottom-1 text-3xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
          {icon}
        </div>
        <div className="text-[#0099FF] font-black text-[10px] mb-1 italic opacity-70">
          STEP 0{step}
        </div>
        <h4 className="text-[14px] font-black text-[#222] group-hover:text-[#0099FF] transition-colors break-keep">
          {title}
        </h4>
        <p className="text-[11px] text-[#A0A0A0] font-bold mt-0.5 leading-tight break-keep">
          {desc}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="absolute -right-2 -bottom-2 text-5xl opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
        {icon}
      </div>
      <div className="text-[#0099FF] font-black text-xs mb-3 italic">
        STEP 0{step}
      </div>
      <h4 className="text-[17px] font-black text-[#222] group-hover:text-[#0099FF] transition-colors break-keep">
        {title}
      </h4>
      <p className="text-[13px] text-[#A0A0A0] font-bold mt-1 leading-relaxed break-keep">
        {desc}
      </p>
    </div>
  )
}
