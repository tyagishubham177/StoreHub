'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProductWithRelations } from '@/types/products';
import { formatCurrency } from '@/lib/utils';
import { getProductBySlug } from '@/lib/products/catalog';

export default function ProductDetailClient({
  product: initialProduct,
}: {
  product: Awaited<ReturnType<typeof getProductBySlug>>;
}) {
  const [product, setProduct] = useState(initialProduct);
  const defaultImage = product?.images.find((image) => image.is_default) ?? product?.images[0] ?? null;
  const [primaryImage, setPrimaryImage] = useState(defaultImage);
  const [loading, setLoading] = useState(false);

  if (!product) {
    return null;
  }

  const priceLabel =
    product.lowestPrice === product.highestPrice
      ? formatCurrency(product.lowestPrice)
      : `${formatCurrency(product.lowestPrice)} – ${formatCurrency(product.highestPrice)}`;

  const sizeLabels = Array.from(
    new Set(product.variants.map((variant) => variant.size?.label).filter((value): value is string => Boolean(value)))
  );
  const colorLabels = Array.from(
    new Set(product.variants.map((variant) => variant.color?.name).filter((value): value is string => Boolean(value)))
  );

  return (
    <div className="product-detail__layout">
      <section className="product-detail__gallery">
        <div className={`product-detail__main-image-container ${loading ? 'loading' : ''}`}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? product.name}
              width={primaryImage.width ?? 900}
              height={primaryImage.height ?? 900}
              sizes="(min-width: 1024px) 480px, 100vw"
              priority
              onLoad={() => setLoading(false)}
            />
          ) : (
            <div className="product-detail__placeholder">Photography coming soon</div>
          )}
        </div>

        <div className="product-detail__thumbnails">
          {product.images.map((image) => (
            <button
              key={image.id}
              onClick={() => {
                setLoading(true);
                setPrimaryImage(image);
              }}
              className="product-detail__thumbnail-button"
            >
              <Image
                src={image.url}
                alt={image.alt_text ?? product.name}
                width={image.width ?? 420}
                height={image.height ?? 420}
                sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 100vw"
                loading="lazy"
                className={primaryImage?.id === image.id ? 'product-detail__thumbnail--selected' : ''}
              />
            </button>
          ))}
        </div>
      </section>

      <section className="product-detail__info">
        <p className="product-detail__brand">{product.brand?.name ?? 'Independent label'}</p>
        <h1>{product.name}</h1>
        <p className="product-detail__price">{priceLabel}</p>

        {product.description ? <p className="product-detail__description">{product.description}</p> : null}

        <dl className="product-detail__meta">
          {sizeLabels.length ? (
            <div>
              <dt>Available sizes</dt>
              <dd>{sizeLabels.join(', ')}</dd>
            </div>
          ) : null}

          {colorLabels.length ? (
            <div>
              <dt>Colors</dt>
              <dd>{colorLabels.join(', ')}</dd>
            </div>
          ) : null}

          <div>
            <dt>Total stock</dt>
            <dd>{product.availableStock} pairs</dd>
          </div>

          {product.tags.length ? (
            <div>
              <dt>Tags</dt>
              <dd>
                {product.tags.map((tag) => (
                  <span key={tag.id} className="product-detail__tag">
                    #{tag.slug ?? tag.name}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>

        <section className="product-detail__variants">
          <h2>Variants in stock</h2>
          <ul>
            {product.variants.map((variant) => (
              <li key={variant.id}>
                <div>
                  <span>{variant.size?.label ?? 'Size TBD'}</span>
                  {' · '}
                  <span>{variant.color?.name ?? 'Color TBD'}</span>
                </div>
                <div>
                  <span>{formatCurrency(variant.price)}</span>
                  <span className="product-detail__stock">{variant.stock_qty} in stock</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </div>
  );
}
