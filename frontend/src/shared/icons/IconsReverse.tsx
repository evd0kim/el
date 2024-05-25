import { Ref, SVGProps, forwardRef, memo } from 'react'
const SvgReverse = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    className={className}
    fill={'none'}
    ref={ref}
    viewBox={'0 0 32 32'}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path
      d={'M5 8.5h22m0 0L21 3m6 5.5L21 14m6 9.5H5m0 0 6-5.5m-6 5.5 6 5.5'}
      stroke={'#fff'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={3}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgReverse)
const IconReverse = memo(ForwardRef)

export default IconReverse
