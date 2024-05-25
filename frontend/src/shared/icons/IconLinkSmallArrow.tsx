import { Ref, SVGProps, forwardRef, memo } from 'react'

const SvgArrow = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    className={className}
    fill={'none'}
    ref={ref}
    viewBox={'0 0 12 12'}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path
      d={'M1 10.5 10.5 1m0 0h-8m8 0v6.5'}
      stroke={'#fff'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={2}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgArrow)
const IconLinkSmallArrow = memo(ForwardRef)

export default IconLinkSmallArrow
