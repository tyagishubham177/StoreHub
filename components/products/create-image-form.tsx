'use client';

import { useState, useRef } from 'react';
import { useFormState } from 'react-dom';
import { createProductImage } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ProductVariantWithRelations } from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSupabaseClient } from '@/lib/supabase/client';

interface CreateImageFormProps {
  productId: string;
  variants: ProductVariantWithRelations[];
  writesEnabled: boolean;
}

export default function CreateImageForm({ productId, variants, writesEnabled }: CreateImageFormProps) {
  const [state, formAction] = useFormState(createProductImage, initialActionState);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [storagePath, setStoragePath] = useState('');

  const disabled = !writesEnabled || uploading;
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setUploadError(null);

    const supabase = createSupabaseClient();
    const fileName = `${productId}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    setUploading(false);

    if (error) {
      setUploadError(error.message);
    } else if (data) {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setUrl(publicUrl);
      setStoragePath(data.path);
    }
  };

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        if (state.status === 'success') {
          formRef.current?.reset();
          setUrl('');
          setStoragePath('');
        }
      }}
      className="grid gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"
    >
      <input type="hidden" name="product_id" value={productId} />

      <div className="grid gap-2">
        <Label htmlFor="image-upload">Upload Image</Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="url">Image URL</Label>
        <Input
          id="url"
          type="url"
          name="url"
          required
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="variant_id">Variant (optional)</Label>
          <Select name="variant_id" defaultValue="null" disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">Unassigned</SelectItem>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.sku}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="width">Width (px)</Label>
          <Input
            id="width"
            type="number"
            name="width"
            min="0"
            step="1"
            placeholder="1200"
            disabled={disabled}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            name="height"
            min="0"
            step="1"
            placeholder="900"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="storage_path">Storage path (optional)</Label>
        <Input
          id="storage_path"
          type="text"
          name="storage_path"
          placeholder="product-images/pegasus-1.jpg"
          value={storagePath}
          onChange={(e) => setStoragePath(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="alt_text">Alt text (optional)</Label>
        <Input
          id="alt_text"
          type="text"
          name="alt_text"
          placeholder="Side profile of the Pegasus"
          disabled={disabled}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <FormMessage state={state} />
          {disabled && !uploading && <p className="m-0 font-semibold text-yellow-600">{VIEW_ONLY_MESSAGE}</p>}
        </div>
        <SubmitButton disabled={disabled} pendingLabel="Saving…">
          Add image
        </SubmitButton>
      </div>
    </form>
  );
}
