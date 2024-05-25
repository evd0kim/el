import { Ref, SVGProps, forwardRef } from 'react'
const SvgVenom = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        'M24.8 3a4.6 4.6 0 0 0-4 1.4c-1 1-1.2 2.3-1 3.7l.6 3.5c0 1.8-.2 3.5-.9 5.1-.5 1.5-1.3 2.6-3 2.9H15c-1.7-.3-2.6-1.4-3.1-2.9-.6-1.6-1-3.4-.8-5 0-1.2.3-2.4.5-3.6A4.2 4.2 0 0 0 9 3.2C8.2 3 7.4 3 6.7 3.1A4.3 4.3 0 0 0 3 7.2c0 .8.2 1.5.6 2.2.7 1 1.8 1.8 2.8 2.6.7.6 1.8 2.1 2.3 3.8l1 3.1 1.1 6.1c.7 3 2.8 3.6 5 3.7 2-.1 4.2-.8 4.9-3.7.3-1.4.8-4.6 1.2-6l.9-3.2A9.5 9.5 0 0 1 25 12c1-.8 2.1-1.6 2.8-2.6a4 4 0 0 0 .6-2.2c0-2-1.5-3.8-3.7-4.1Z'
      }
      fill={'url(#a)'}
    />
    <defs>
      <linearGradient gradientUnits={'userSpaceOnUse'} id={'a'} x1={5.5} x2={52.8} y1={6} y2={38.9}>
        <stop stopColor={'#11A97D'} />
        <stop offset={1} stopColor={'#6610F2'} />
      </linearGradient>
    </defs>
  </svg>
)
const IconVenom = forwardRef(SvgVenom)

export default IconVenom
