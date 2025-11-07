'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { CatalogProduct } from '@/types/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: CatalogProduct;
  imageHeight?: number;
}

const unique = <T,>(values: T[]) => Array.from(new Set(values));

export default function StorefrontProductCard({ product, imageHeight }: ProductCardProps) {
  const initialImageIndex = Math.max(
    0,
    product.images.findIndex((candidate) => candidate.is_default)
  );
  const [activeImageIndex, setActiveImageIndex] = useState(initialImageIndex);
  const image = product.images[activeImageIndex] ?? null;
  const imageContainerHeight = imageHeight ? Math.max(120, Math.round(imageHeight)) : null;
  const imageContainerClass = cn(
    'relative w-full bg-gradient-to-br from-gray-100 to-gray-200',
    imageContainerHeight ? 'h-auto' : 'h-48'
  );

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

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
          <div
            className={imageContainerClass}
            style={imageContainerHeight ? { height: `${imageContainerHeight}px` } : undefined}
          >
            {image ? (
              <Image
                src={image.url}
                alt={image.alt_text ?? product.name}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-500">
                Image coming soon
              </div>
            )}
            {product.images.length > 1 ? (
              <>
                <Button
                  onClick={handlePrevImage}
                  size="icon"
                  variant="secondary"
                  className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleNextImage}
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            ) : null}
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
