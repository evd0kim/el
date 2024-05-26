import { Ref, SVGProps, forwardRef, memo } from 'react'

const SvgTwitter = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    className={className}
    fill={'none'}
    ref={ref}
    viewBox={'0 0 32 32'}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path
      d={
        'm3 4 10.1 13.2L3 28h2.3l8.8-9.4 7.2 9.4H29L18.4 14l9.4-10h-2.3l-8.1 8.7L10.8 4H3.1Zm3.4 1.7H10l15.7 20.6H22L6.4 5.7Z'
      }
      fill={'#E1E1E1'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgTwitter)
const IconTwitter = memo(ForwardRef)

export default IconTwitter
