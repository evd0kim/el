import { Ref, SVGProps, forwardRef, memo } from 'react'
const SvgMetaMask = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    className={className}
    ref={ref}
    viewBox={'0 0 280 250'}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <g fill={'none'}>
      <g strokeLinecap={'round'} strokeLinejoin={'round'} transform={'translate(1 1)'}>
        <path d={'m246.1.2-101.1 75 18.8-44.2z'} fill={'#e17726'} stroke={'#e17726'}></path>
        <g fill={'#e27625'} stroke={'#e27625'} transform={'translate(2)'}>
          <path d={'m10.9.2 100.2 75.7-17.9-44.9z'}></path>
          <path d={'m207.7 174.1-26.9 41.2 57.6 15.9 16.5-56.2z'}></path>
          <path d={'m.2 175 16.4 56.2 57.5-15.9-26.8-41.2z'}></path>
          <path d={'m71 104.5-16 24.2 57 2.6-1.9-61.5z'}></path>
          <path d={'m184 104.5-39.7-35.4-1.3 62.2 57-2.6z'}></path>
          <path d={'m74.1 215.3 34.5-16.7-29.7-23.2z'}></path>
          <path d={'m146.4 198.6 34.4 16.7-4.7-39.9z'}></path>
        </g>
        <g fill={'#d5bfb2'} stroke={'#d5bfb2'} transform={'translate(76 198)'}>
          <path d={'m106.8 17.3-34.4-16.7 2.8 22.4-.3 9.5z'}></path>
          <path d={'m.1 17.3 32 15.2-.2-9.5 2.7-22.4z'}></path>
        </g>
        <path d={'m108.7 160.6-28.6-8.4 20.2-9.3z'} fill={'#233447'} stroke={'#233447'}></path>
        <path d={'m150.3 160.6 8.4-17.7 20.3 9.3z'} fill={'#233447'} stroke={'#233447'}></path>
        <g fill={'#cc6228'} stroke={'#cc6228'} transform={'translate(49 128)'}>
          <path d={'m27.1 87.3 5-41.2-31.8.9z'}></path>
          <path d={'m128.9 46.1 4.9 41.2 26.9-40.3z'}></path>
          <path d={'m153 .7-57 2.6 5.3 29.3 8.4-17.7 20.3 9.3z'}></path>
          <path d={'m31.1 24.2 20.2-9.3 8.4 17.7 5.3-29.3-57-2.6z'}></path>
        </g>
        <g fill={'#e27525'} stroke={'#e27525'} transform={'translate(57 128)'}>
          <path d={'m0 .7 23.9 46.7-.8-23.2z'}></path>
          <path d={'m122 24.2-.9 23.2 23.9-46.7z'}></path>
          <path d={'m57 3.3-5.3 29.3 6.7 34.6 1.5-45.6z'}></path>
          <path d={'m88 3.3-2.8 18.2 1.4 45.7 6.7-34.6z'}></path>
        </g>
        <path
          d={'m150.3 160.6-6.7 34.6 4.8 3.4 29.7-23.2.9-23.2z'}
          fill={'#f5841f'}
          stroke={'#f5841f'}
        ></path>
        <path
          d={'m80.1 152.2.8 23.2 29.7 23.2 4.8-3.4-6.7-34.6z'}
          fill={'#f5841f'}
          stroke={'#f5841f'}
        ></path>
        <path
          d={
            'm150.9 230.5.3-9.5-2.6-2.2h-38.2l-2.5 2.2.2 9.5-32-15.2 11.2 9.2 22.7 15.7h38.9l22.8-15.7 11.1-9.2z'
          }
          fill={'#c0ac9d'}
          stroke={'#c0ac9d'}
        ></path>
        <path
          d={'m148.4 198.6-4.8-3.4h-28.2l-4.8 3.4-2.7 22.4 2.5-2.2h38.2l2.6 2.2z'}
          fill={'#161616'}
          stroke={'#161616'}
        ></path>
        <g fill={'#763e1a'} stroke={'#763e1a'}>
          <path
            d={
              'm250.4 80.1 8.5-41.4-12.8-38.5-97.7 72.5 37.6 31.8 53.1 15.5 11.7-13.7-5.1-3.7 8.1-7.4-6.2-4.8 8.1-6.2z'
            }
          ></path>
          <path
            d={
              'm.1 38.7 8.6 41.4-5.5 4.1 8.2 6.2-6.2 4.8 8.1 7.4-5.1 3.7 11.7 13.7 53.1-15.5 37.6-31.8-97.7-72.5z'
            }
          ></path>
        </g>
        <g fill={'#f5841f'} stroke={'#f5841f'}>
          <path d={'m239.1 120-53.1-15.5 16 24.2-23.9 46.7 31.6-.4h47.2z'}></path>
          <path d={'m73 104.5-53.1 15.5-17.7 55h47.1l31.6.4-23.9-46.7z'}></path>
          <path
            d={
              'm145 131.3 3.4-58.6 15.4-41.7h-68.6l15.4 41.7 3.4 58.6 1.3 18.4.1 45.5h28.2l.1-45.5z'
            }
          ></path>
        </g>
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgMetaMask)

const IconMetaMask = memo(ForwardRef)

export default IconMetaMask
