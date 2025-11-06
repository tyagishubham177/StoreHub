'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import type { ProductWithRelations } from '@/types/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  restoreProduct as restoreProductAction,
  softDeleteProduct as softDeleteProductAction,
} from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import SubmitButton from './submit-button';
import FormPendingOverlay from './form-pending-overlay';

interface ProductSelectorProps {
  products: ProductWithRelations[];
  selectedProductId: string | null;
  writesEnabled: boolean;
  onSelectProduct: (product: ProductWithRelations) => void;
}

export default function ProductSelector({ products, selectedProductId, writesEnabled, onSelectProduct }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [, archiveAction] = useFormState(softDeleteProductAction, initialActionState);
  const [, restoreAction] = useFormState(restoreProductAction, initialActionState);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="shrink-0">
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredProducts.length ? (
            filteredProducts.map((product) => {
              const isSelected = selectedProductId === product.id;
              const isArchived = Boolean(product.deleted_at) || product.status === 'archived';
              const archiveLabel = isArchived ? 'Restore' : 'Archive';
              const archiveFormAction = isArchived ? restoreAction : archiveAction;
              const pendingLabel = isArchived ? 'Restoring…' : 'Archiving…';
              const overlayLabel = isArchived ? 'Restoring product…' : 'Archiving product…';

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
                      className="relative"
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
                      <FormPendingOverlay label={overlayLabel} className="rounded-md" />
                      <input type="hidden" name="product_id" value={String(product.id)} />
                      <SubmitButton
                        size="sm"
                        variant="ghost"
                        className={cn('text-destructive', isArchived && 'text-emerald-600')}
                        disabled={!writesEnabled}
                        pendingLabel={pendingLabel}
                      >
                        {archiveLabel}
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No products match your search.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
