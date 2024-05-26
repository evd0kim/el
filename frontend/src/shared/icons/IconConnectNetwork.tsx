import { Ref, SVGProps, forwardRef, memo } from 'react'
const SvgConnectNetwork = (
  { className, ...props }: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>
) => (
  <svg
    className={className}
    fill={'none'}
    height={32}
    ref={ref}
    viewBox={'0 0 32 32'}
    width={32}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <g clipPath={'url(#a)'} fill={'#E1E1E1'}>
      <path
        d={
          'M18.5 13.5c0-.7-.5-1.3-1.2-1.3h-.7a7 7 0 1 0 0 14H23a7 7 0 0 0 2-13.7c-.7-.2-1.4.4-1.4 1.1 0 .7.5 1.2 1.1 1.5a4.5 4.5 0 0 1-1.7 8.5h-6.4a4.5 4.5 0 0 1 0-8.9h.7c.7 0 1.2-.5 1.2-1.2Z'
        }
      />
      <path
        d={
          'M15.4 5.8a7 7 0 1 1 0 14h-.7a1.3 1.3 0 1 1 0-2.5h.7a4.5 4.5 0 0 0 0-9H9A4.5 4.5 0 0 0 7.3 17c.6.3 1 .8 1 1.4v.1c0 .7-.6 1.3-1.3 1.1A7 7 0 0 1 9 5.8h6.4Z'
        }
      />
    </g>
    <defs>
      <clipPath id={'a'}>
        <path d={'M0 0h32v32H0z'} fill={'#fff'} />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(SvgConnectNetwork)
const IconConnectNetwork = memo(ForwardRef)

export default IconConnectNetwork
