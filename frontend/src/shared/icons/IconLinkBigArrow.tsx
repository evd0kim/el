import { Ref, SVGProps, forwardRef, memo } from 'react'
const SvgLinkBigArrow = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    fill={'none'}
    ref={ref}
    viewBox={'0 0 32 33'}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path
      d={
        'M7.1 23.6A1.3 1.3 0 0 0 9 25.4l-2-1.8ZM25.3 8.5c0-.7-.6-1.3-1.3-1.3H12.7a1.2 1.2 0 1 0 0 2.5h10v10a1.2 1.2 0 1 0 2.6 0V8.6ZM8.9 25.4l16-16L23 7.6l-16 16 2 1.8Z'
      }
      fill={'#E1E1E1'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgLinkBigArrow)
const IconLinkBigArrow = memo(ForwardRef)

export default IconLinkBigArrow
