import { Ref, SVGProps, forwardRef, memo } from 'react'

const SvgDownload = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    className={className}
    fill={'none'}
    ref={ref}
    viewBox={'0 0 26 24'}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path
      clipRule={'evenodd'}
      d={
        'M13.017 0h.006c.595.003 1.077.49 1.077 1.09v13.345l2.404-3.026c.215-.27.53-.41.85-.409h.006c.235.002.47.08.667.239.467.376.543 1.063.17 1.534l-4.334 5.454a1.082 1.082 0 0 1-.839.41h-.007c-.33 0-.64-.151-.846-.41l-4.334-5.454a1.097 1.097 0 0 1 .17-1.534c.199-.16.436-.238.673-.239h.007c.316.001.63.142.843.41l2.404 3.025V1.091c0-.602.485-1.091 1.083-1.091Z'
      }
      fill={'#E1E1E1'}
    />
    <path
      d={
        'M24.917 10.91h.006C25.518 10.911 26 11.4 26 12v8.727c0 .869-.342 1.701-.952 2.314A3.234 3.234 0 0 1 22.77 24H3.25a3.235 3.235 0 0 1-2.298-.959A3.28 3.28 0 0 1 0 20.727V12c0-.602.485-1.09 1.083-1.09h.007c.595.002 1.077.49 1.077 1.09v8.727c0 .29.113.567.317.771.203.206.479.32.766.32h19.506a1.092 1.092 0 0 0 1.077-1.09V12c0-.602.486-1.09 1.084-1.09Z'
      }
      fill={'#E1E1E1'}
    />
  </svg>
)

const ForwardRef = forwardRef(SvgDownload)

export const IconDownload = memo(ForwardRef)
