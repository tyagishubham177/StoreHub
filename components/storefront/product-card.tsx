import Image from 'next/image';
import Link from 'next/link';
import type { CatalogProduct } from '@/types/products';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface ProductCardProps {
  product: CatalogProduct;
}

const unique = <T,>(values: T[]) => Array.from(new Set(values));

export default function StorefrontProductCard({ product }: ProductCardProps) {
  const image = product.images[0] ?? null;
  const priceLabel =
    product.lowestPrice === product.highestPrice
      ? currency.format(product.lowestPrice)
      : `${currency.format(product.lowestPrice)} – ${currency.format(product.highestPrice)}`;

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
    <article className="catalog-card">
      <Link href={`/products/${product.slug}`} className="catalog-card__link">
        <div className="catalog-card__image" aria-hidden={image ? undefined : true}>
          {image ? (
            <Image
              src={image.url}
              alt={image.alt_text ?? product.name}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw"
            />
          ) : (
            <div className="catalog-card__placeholder">Image coming soon</div>
          )}
        </div>

        <div className="catalog-card__body">
          <span className="catalog-card__brand">{product.brand?.name ?? 'Independent'}</span>
          <h3>{product.name}</h3>
          <p className="catalog-card__price">{priceLabel}</p>

          {sizeLabels.length ? (
            <p className="catalog-card__sizes">Sizes: {sizeLabels.join(', ')}</p>
          ) : null}

          {colors.length ? (
            <div className="catalog-card__colors" aria-label="Available colors">
              {colors.map((color) => (
                <span
                  key={color.id}
                  className="catalog-card__color"
                  title={color.name}
                  style={{ backgroundColor: color.hex ?? '#e5e7eb' }}
                />
              ))}
            </div>
          ) : null}

          {product.tags.length ? (
            <ul className="catalog-card__tags">
              {product.tags.slice(0, 3).map((tag) => (
                <li key={tag.id}>#{tag.slug ?? tag.name}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
