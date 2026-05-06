import { Globe, Lock } from 'lucide-react';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Card, CardContent, CardHeader } from '@/crd/primitives/card';

export type SpaceGridCardData = {
  id: string;
  title: string;
  description: string | null;
  href: string;
  /** Banner image. When omitted, the deterministic gradient (`color`) is rendered instead. */
  imageUrl?: string;
  /** Deterministic accent colour (from `pickColorFromId(id)`). */
  color: string;
  isPrivate: boolean;
};

export type SpaceGridCardProps = {
  space: SpaceGridCardData;
  className?: string;
};

export function SpaceGridCard({ space, className }: SpaceGridCardProps) {
  const banner = space.imageUrl ? { backgroundImage: `url(${space.imageUrl})` } : backgroundGradient(space.color);

  return (
    <a
      href={space.href}
      className={cn(
        'block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className
      )}
      aria-label={space.title}
    >
      <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer h-full flex flex-col gap-0">
        <div className="relative h-32 w-full bg-muted overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={banner}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <div className="h-6 w-6 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-muted-foreground shadow-sm">
              {space.isPrivate ? (
                <Lock className="w-3 h-3" aria-hidden="true" />
              ) : (
                <Globe className="w-3 h-3" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        <CardHeader className="p-4 pb-2">
          <h3 className="text-card-title group-hover:text-primary transition-colors line-clamp-1">{space.title}</h3>
        </CardHeader>

        {space.description ? (
          <CardContent className="p-4 pt-0 flex-1">
            <p className="text-body text-muted-foreground line-clamp-2">{space.description}</p>
          </CardContent>
        ) : null}
      </Card>
    </a>
  );
}
