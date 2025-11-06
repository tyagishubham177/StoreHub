import Image from 'next/image';
import Link from 'next/link';
import type { CatalogProduct } from '@/types/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: CatalogProduct;
}

const unique = <T,>(values: T[]) => Array.from(new Set(values));

export default function StorefrontProductCard({ product }: ProductCardProps) {
  const image = product.images.find((candidate) => candidate.is_default) ?? product.images[0] ?? null;
  const priceLabel =
    product.lowestPrice === product.highestPrice
      ? formatCurrency(product.lowestPrice)
      : `${formatCurrency(product.lowestPrice)} – ${formatCurrency(product.highestPrice)}`;

  const sizeLabels = unique(
    product.variants
      .map((variant) => variant.size?.label)
      .filter((label): label is string => Boolean(label))
  );

  const colors = unique(
    product.variants
      .map((variant) =>
        variant.color
          ? {
              id: variant.color.id,
              name: variant.color.name,
              hex: variant.color.hex ?? null,
            }
          : null
      )
      .filter((value): value is { id: number; name: string; hex: string | null } => Boolean(value))
  ).slice(0, 6);

  return (
    <Card className="flex flex-col">
      <Link href={`/products/${product.slug}`}>
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt_text ?? product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-500">
                Image coming soon
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {product.brand?.name ?? 'Independent'}
          </p>
          <CardTitle className="mt-1 text-lg">{product.name}</CardTitle>
          <p className="mt-2 text-sm font-medium">{priceLabel}</p>
          {sizeLabels.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">Sizes: {sizeLabels.join(', ')}</p>
          )}
          {colors.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              {colors.map((color) => (
                <span
                  key={color.id}
                  className="h-4 w-4 rounded-full border"
                  title={color.name}
                  style={{ backgroundColor: color.hex ?? '#e5e7eb' }}
                />
              ))}
            </div>
          )}
        </CardContent>
        {product.tags.length > 0 && (
          <CardFooter className="p-4">
            <div className="flex flex-wrap gap-2">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  #{tag.slug ?? tag.name}
                </Badge>
              ))}
            </div>
          </CardFooter>
        )}
      </Link>
    </Card>
  );
}
