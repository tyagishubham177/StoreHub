import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/products/catalog';
import { formatCurrency } from '@/lib/utils';
import ProductDetailClient from '@/components/products/product-detail-client';

export const revalidate = 120;

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
      ? formatCurrency(product.lowestPrice)
      : `${formatCurrency(product.lowestPrice)} – ${formatCurrency(product.highestPrice)}`;
  const coverImage = product.images.find((image) => image.is_default) ?? product.images[0] ?? null;

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

  return (
    <main className="product-detail">
      <nav className="product-detail__nav" aria-label="Breadcrumb">
        <Link href="/">← Back to catalog</Link>
      </nav>
      <ProductDetailClient product={product} />
    </main>
  );
}
