'use client';

import { useState } from 'react';
import type { ProductWithRelations } from '@/types/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  restoreProduct as restoreProductAction,
  softDeleteProduct as softDeleteProductAction,
} from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';

interface ProductSelectorProps {
  products: ProductWithRelations[];
  selectedProductId: string | null;
  writesEnabled: boolean;
  onSelectProduct: (product: ProductWithRelations) => void;
}

const archiveAction = softDeleteProductAction.bind(null, initialActionState);
const restoreAction = restoreProductAction.bind(null, initialActionState);

export default function ProductSelector({ products, selectedProductId, writesEnabled, onSelectProduct }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <div className="space-y-2">
          {filteredProducts.map((product) => {
            const isSelected = selectedProductId === product.id;
            const isArchived = Boolean(product.deleted_at) || product.status === 'archived';
            const archiveLabel = isArchived ? 'Restore' : 'Archive';
            const archiveFormAction = isArchived ? restoreAction : archiveAction;

            return (
              <div
                key={product.id}
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="flex w-full flex-col items-start text-left"
                >
                  <span className="font-semibold">{product.name}</span>
                  <span className="text-sm text-muted-foreground">{product.slug}</span>
                </button>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{product.status.toUpperCase()}</span>
                  <form
                    action={archiveFormAction}
                    onSubmit={(event) => {
                      if (writesEnabled) {
                        if (!window.confirm(`${archiveLabel} this product?`)) {
                          event.preventDefault();
                        }
                      } else {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="product_id" value={String(product.id)} />
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className={cn('text-destructive', isArchived && 'text-emerald-600')}
                      disabled={!writesEnabled}
                    >
                      {archiveLabel}
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
