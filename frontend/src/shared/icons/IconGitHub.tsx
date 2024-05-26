import { Ref, SVGProps, forwardRef, memo } from 'react'

const SvgGitHub = ({ className, ...props }: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        'M16 3.2a12.8 12.8 0 0 0-3.1 25.2l-.1-.6v-2.2h-1.6c-.9 0-1.7-.4-2-1-.5-.9-.5-2-1.6-2.8-.3-.2 0-.5.3-.5.7.2 1.2.7 1.7 1.3.5.7.8.9 1.7.9.5 0 1.2 0 1.8-.2a4 4 0 0 1 1.7-2c-4.2-.5-6.3-2.6-6.3-5.5 0-1.2.6-2.4 1.5-3.4-.3-1-.7-3 0-3.9 2 0 3.1 1.3 3.4 1.6a9.6 9.6 0 0 1 6.2 0c.3-.3 1.5-1.6 3.4-1.6.8.8.4 2.9.1 3.9.9 1 1.4 2.2 1.4 3.4 0 2.9-2 5-6.3 5.4 1.2.7 2 2.4 2 3.7V28A12.8 12.8 0 0 0 16 3.2Z'
      }
      fill={'#E1E1E1'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgGitHub)
const IconGitHub = memo(ForwardRef)

export default IconGitHub
