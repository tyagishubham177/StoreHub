'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProductWithRelations } from '@/types/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ProductSelectorProps {
  products: ProductWithRelations[];
  onSelectProduct: (product: ProductWithRelations) => void;
}

export default function ProductSelector({ products, onSelectProduct }: ProductSelectorProps) {
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
              onClick={() => onSelectProduct(product)}
              className="cursor-pointer rounded-lg border p-4 hover:bg-muted"
            >
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.slug}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
