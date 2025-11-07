'use client';

import { useFormState } from 'react-dom';
import { deleteBrand, deleteColor, deleteProductType, deleteSize } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import { Button } from '@/components/ui/button';

const deleteActions = {
  brand: deleteBrand,
  color: deleteColor,
  size: deleteSize,
  productType: deleteProductType,
} as const;

const fieldNames = {
  brand: 'brand_id',
  color: 'color_id',
  size: 'size_id',
  productType: 'product_type_id',
} as const;

const labels = {
  brand: 'brand',
  color: 'color',
  size: 'size',
  productType: 'product type',
} as const;

interface CatalogListItem {
  id: number;
  name: string;
  description?: string | null;
}

interface CatalogListProps {
  items: CatalogListItem[];
  kind: keyof typeof deleteActions;
  disabled: boolean;
  emptyMessage: string;
}

export default function CatalogList({ items, kind, disabled, emptyMessage }: CatalogListProps) {
  const [, formAction] = useFormState(deleteActions[kind], initialActionState);
  const fieldName = fieldNames[kind];
  const label = labels[kind];

  if (!items.length) {
    return <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 rounded-md border bg-white px-3 py-2 text-sm shadow-sm">
          <div>
            <p className="font-medium leading-tight">{item.name}</p>
            {item.description ? (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            ) : null}
          </div>
          <form
            action={formAction}
            onSubmit={(event) => {
              if (disabled || !window.confirm(`Delete this ${label}? This cannot be undone.`)) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name={fieldName} value={String(item.id)} />
            <Button type="submit" variant="ghost" size="sm" className="text-destructive" disabled={disabled}>
              Delete
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
