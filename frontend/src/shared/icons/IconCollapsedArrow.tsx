import { Ref, SVGProps, forwardRef, memo } from 'react'

const SvgCollapsedArrow = (
  { className, color, ...props }: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>
) => (
  <svg
    className={className}
    fill={'none'}
    ref={ref}
    viewBox={'0 0 16 17'}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path
      d={'M13.6 5.5H2.4c-.1 0-.2.2-.1.3l5.5 6.5c.1.1.3.1.4 0l5.5-6.5c.1-.1 0-.3-.1-.3Z'}
      fill={color}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgCollapsedArrow)
const IconCollapsedArrow = memo(ForwardRef)

export default IconCollapsedArrow
