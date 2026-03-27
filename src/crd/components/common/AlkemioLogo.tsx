import { cn } from '@/crd/lib/utils';

const SVG_PATHS = {
  background: 'M63.7 0H0V61.1H63.7V0Z',
  shape1:
    'M29.2 25.1C28.1 26.9 26.4 28.1 24.4 28.5H24.3C22.5 29 20.8 30.1 19.8 31.8C18.8 33.5 18.6 35.4 19 37.2C19.6 39.1 19.5 41.3 18.4 43.2C16.3 46.7 11.9 47.8 8.4 45.7C4.9 43.6 3.8 39.2 5.9 35.7C6.5 34.7 7.3 33.9 8.2 33.3C9 33 10 32.6 11 32.4C12.7 31.9 14.2 30.8 15.2 29.2C15.7 28.3 16 27.4 16.2 26.5C16.3 25.6 16.3 24.7 16.1 23.8C15.4 21.9 15.6 19.7 16.7 17.8C18.7 14.3 23.2 13.2 26.7 15.3C30.1 17.2 31.2 21.7 29.2 25.1Z',
  shape2:
    'M58.9 39.8C58.9 43.8 55.7 47 51.7 47C49.6 47 47.7 46.1 46.4 44.7C45.1 43.4 43.3 42.5 41.3 42.5C39.4 42.5 37.6 43.3 36.3 44.5C35 46 33.1 47 30.9 47C26.9 47 23.7 43.8 23.7 39.8C23.7 35.9 26.9 32.6 30.9 32.6C33.1 32.6 35.1 33.6 36.4 35.2C37.7 36.4 39.4 37.1 41.2 37.1C42.2 37.1 43.1 36.9 44 36.5C44.8 36.1 45.6 35.6 46.2 35C47.5 33.5 49.5 32.5 51.6 32.5C55.7 32.6 58.9 35.8 58.9 39.8Z',
  shape3:
    'M41.6 28.6C45.5764 28.6 48.8 25.3764 48.8 21.4C48.8 17.4235 45.5764 14.2 41.6 14.2C37.6235 14.2 34.4 17.4235 34.4 21.4C34.4 25.3764 37.6235 28.6 41.6 28.6Z',
};

export function AlkemioLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)} data-name="alkemio-logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 63.7 61.1">
        <g clipPath="url(#alkemio-clip)">
          <path d={SVG_PATHS.background} fill="#09BCD4" />
          <path d={SVG_PATHS.shape1} fill="white" />
          <path d={SVG_PATHS.shape2} fill="white" />
          <path d={SVG_PATHS.shape3} fill="white" />
        </g>
        <defs>
          <clipPath id="alkemio-clip">
            <rect fill="white" height="61.1" width="63.7" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
