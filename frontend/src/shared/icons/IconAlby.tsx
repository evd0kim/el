import { Ref, SVGProps, forwardRef, memo } from 'react'
const SvgAlby = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    className={className}
    fill={'none'}
    ref={ref}
    viewBox={'0 0 32 30'}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path d={'M4.8 9.9a2.8 2.8 0 1 1 0-5.5 2.8 2.8 0 0 1 0 5.5Z'} fill={'#000'} />
    <path d={'M4.3 6.7 9.4 12'} stroke={'#000'} strokeWidth={1.3} />
    <path d={'M27.2 9.9a2.8 2.8 0 1 0 0-5.5 2.8 2.8 0 0 0 0 5.5Z'} fill={'#000'} />
    <path d={'M27.8 6.7 22.6 12'} stroke={'#000'} strokeWidth={1.3} />
    <path
      clipRule={'evenodd'}
      d={
        'M5.5 23.6a3.6 3.6 0 0 1-2-4C4.7 12.7 9.9 7.5 16 7.5c6.2 0 11.4 5.2 12.6 12.2a3.6 3.6 0 0 1-2 4 24.6 24.6 0 0 1-21.2-.1Z'
      }
      fill={'#FFDF6F'}
      fillRule={'evenodd'}
    />
    <path
      d={
        'M4.2 19.8C5.4 13 10.3 8.2 16 8.2V6.8c-6.6 0-12 5.5-13.3 12.7l1.4.3ZM16 8.2c5.8 0 10.8 4.9 12 11.6l1.3-.2C28 12.4 22.7 6.8 16 6.8v1.4ZM26.4 23A24 24 0 0 1 16 25.3v1.3c3.9 0 7.6-.8 10.8-2.4l-.5-1.2ZM16 25.3c-3.6 0-7.1-.9-10.3-2.4l-.6 1.3c3.3 1.6 7 2.4 11 2.4v-1.3Zm12-5.5a3 3 0 0 1-1.7 3.2l.5 1.2a4.3 4.3 0 0 0 2.5-4.6l-1.4.2Zm-25.3-.3a4.3 4.3 0 0 0 2.4 4.7l.6-1.3a3 3 0 0 1-1.6-3.1l-1.4-.3Z'
      }
      fill={'#000'}
    />
    <path
      clipRule={'evenodd'}
      d={
        'M8.2 21.8c-1.2-.5-2-1.7-1.5-3 1.3-3.7 5-6.4 9.4-6.4s8.1 2.7 9.4 6.5c.4 1.2-.3 2.4-1.5 3a21 21 0 0 1-15.8 0Z'
      }
      fill={'#000'}
      fillRule={'evenodd'}
    />
    <path
      d={
        'M19.3 20c1.2 0 2.3-.8 2.3-1.8s-1-1.8-2.3-1.8c-1.3 0-2.3.8-2.3 1.8s1 1.9 2.3 1.9Zm-6.6 0c1.3 0 2.3-.8 2.3-1.8s-1-1.8-2.3-1.8c-1.3 0-2.3.8-2.3 1.8s1 1.9 2.3 1.9Z'
      }
      fill={'#fff'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgAlby)
const IconAlby = memo(ForwardRef)

export default IconAlby
