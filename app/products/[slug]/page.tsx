import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/products/catalog';

export const revalidate = 120;

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

type PageParams = {
  params: {
    slug: string;
  };
};

const summarize = (value: string | null | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }
  return value.length > 180 ? `${value.slice(0, 177)}…` : value;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return {
      title: 'Product not found',
    };
  }

  const priceLabel =
    product.lowestPrice === product.highestPrice
      ? currency.format(product.lowestPrice)
      : `${currency.format(product.lowestPrice)} – ${currency.format(product.highestPrice)}`;
  const coverImage = product.images[0] ?? null;

  return {
    title: `${product.name} • StoreHub Footwear`,
    description: summarize(
      product.description,
      `Explore ${product.name}${product.brand ? ` from ${product.brand.name}` : ''} at StoreHub.`
    ),
    openGraph: {
      title: `${product.name} • StoreHub Footwear`,
      description: summarize(
        product.description,
        `Discover ${product.name} with real-time inventory data.`
      ),
      images: coverImage
        ? [
            {
              url: coverImage.url,
              width: coverImage.width ?? 1200,
              height: coverImage.height ?? 630,
              alt: coverImage.alt_text ?? product.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} • StoreHub Footwear`,
      description: summarize(
        product.description,
        `Discover ${product.name} with real-time inventory data.`
      ),
      images: coverImage ? [coverImage.url] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageParams) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const priceLabel =
    product.lowestPrice === product.highestPrice
      ? currency.format(product.lowestPrice)
      : `${currency.format(product.lowestPrice)} – ${currency.format(product.highestPrice)}`;
  const primaryImage = product.images[0] ?? null;
  const otherImages = product.images.slice(1);

  const sizeLabels = Array.from(
    new Set(product.variants.map((variant) => variant.size?.label).filter((value): value is string => Boolean(value)))
  );
  const colorLabels = Array.from(
    new Set(product.variants.map((variant) => variant.color?.name).filter((value): value is string => Boolean(value)))
  );

  return (
    <main className="product-detail">
      <nav className="product-detail__nav" aria-label="Breadcrumb">
        <Link href="/">← Back to catalog</Link>
      </nav>

      <div className="product-detail__layout">
        <section className="product-detail__gallery">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? product.name}
              width={primaryImage.width ?? 900}
              height={primaryImage.height ?? 900}
              sizes="(min-width: 1024px) 480px, 100vw"
              priority
            />
          ) : (
            <div className="product-detail__placeholder">Photography coming soon</div>
          )}

          {otherImages.length ? (
            <div className="product-detail__thumbnails">
              {otherImages.map((image) => (
                <Image
                  key={image.id}
                  src={image.url}
                  alt={image.alt_text ?? product.name}
                  width={image.width ?? 420}
                  height={image.height ?? 420}
                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 100vw"
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}
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
                    <span>{currency.format(variant.price)}</span>
                    <span className="product-detail__stock">{variant.stock_qty} in stock</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </section>
      </div>
    </main>
  );
}
