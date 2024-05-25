import { Ref, SVGProps, forwardRef, memo } from 'react'
const SvgCopy = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    className={className}
    fill={'none'}
    ref={ref}
    viewBox={'0 0 642 800'}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path
      d={
        'M435.8 140H64A63.3 63.3 0 0 0 .7 203.1v533.6A63.3 63.3 0 0 0 64 800h372a63.3 63.3 0 0 0 63.2-63.2V203.2a63.5 63.5 0 0 0-63.3-63.3Zm18.9 596.6a19 19 0 0 1-19 19h-372a19 19 0 0 1-19-19V203.2a19 19 0 0 1 19-19h372a19 19 0 0 1 19 19v533.4Z'
      }
      fill={'#fff'}
    />
    <path
      d={
        'M578 0H206.3A63.3 63.3 0 0 0 143 63.2a22 22 0 0 0 22 22.2 22 22 0 0 0 22.1-22.2 19 19 0 0 1 19-19h372a19 19 0 0 1 19 19v533.6a19 19 0 0 1-19 19 22 22 0 0 0-22.2 22.2 22 22 0 0 0 22.2 22 63.3 63.3 0 0 0 63.2-63.2V63.2A63.3 63.3 0 0 0 578 0Z'
      }
      fill={'#fff'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgCopy)
const IconCopy = memo(ForwardRef)

export default IconCopy
