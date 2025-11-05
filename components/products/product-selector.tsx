'use client';

'use client';

import { useState } from 'react';
import type { ProductWithRelations } from '@/types/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Edit } from 'lucide-react';
import { softDeleteProduct } from '@/app/products/actions';
import DeleteButton from './delete-button';

interface ProductSelectorProps {
  products: ProductWithRelations[];
  onSelectProduct: (product: ProductWithRelations) => void;
  selectedProduct: ProductWithRelations | null;
}

export default function ProductSelector({ products, onSelectProduct, selectedProduct }: ProductSelectorProps) {
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
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`cursor-pointer rounded-lg border p-4 hover:bg-muted ${
                selectedProduct?.id === product.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div onClick={() => onSelectProduct(product)}>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.slug}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit size={16} />
                  </button>
                  <DeleteButton
                    action={softDeleteProduct}
                    itemId={product.id}
                    itemName={product.name}
                    itemType="product"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
