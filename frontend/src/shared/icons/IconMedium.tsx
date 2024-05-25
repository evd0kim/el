import * as React from 'react'
import { Ref, SVGProps, forwardRef, memo } from 'react'
const SvgMedium = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    className={className}
    fill={'none'}
    ref={ref}
    viewBox={'0 0 800 456'}
    xmlns={'http://www.w3.org/2000/svg'}
    xmlnsXlink={'http://www.w3.org/1999/xlink'}
    {...props}
  >
    <path
      d={
        'M225.6.9A226.4 226.4 0 0 1 451.2 228c0 125.4-101 227.1-225.6 227.1A226.4 226.4 0 0 1 0 228.1C0 102.6 101 .9 225.6.9ZM586 14.2c62.3 0 112.9 95.7 112.9 213.9 0 118-50.5 213.8-112.9 213.8-62.3 0-112.8-95.8-112.8-213.8C473.1 110 523.6 14 586 14Zm174.4 22.3c22 0 39.7 85.7 39.7 191.6 0 105.7-17.8 191.5-39.7 191.5-21.9 0-39.6-85.7-39.6-191.5 0-105.9 17.7-191.6 39.6-191.6Z'
      }
      fill={'#E1E1E1'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgMedium)
const IconMedium = memo(ForwardRef)

export default IconMedium
