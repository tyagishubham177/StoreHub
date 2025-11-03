'use client';

import { useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { updateWritesEnabled } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';

interface WriteModeCardProps {
  writesEnabled: boolean;
}

const STATUS_STYLES = {
  enabled: {
    backgroundColor: '#d1fae5',
    color: '#047857',
    label: 'Writes enabled',
  },
  disabled: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    label: 'View-only mode',
  },
};

export default function WriteModeCard({ writesEnabled }: WriteModeCardProps) {
  const [state, formAction] = useFormState(updateWritesEnabled, initialActionState);
  const [selection, setSelection] = useState(writesEnabled ? 'true' : 'false');

  const status = useMemo(() => (writesEnabled ? STATUS_STYLES.enabled : STATUS_STYLES.disabled), [writesEnabled]);
  const viewOnlySelected = selection === 'false';

  return (
    <section
      style={{
        display: 'grid',
        gap: '1.25rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 15px 35px -25px rgba(15, 23, 42, 0.35)',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>Inventory write controls</h2>
            <p style={{ margin: '0.35rem 0 0', color: '#6b7280' }}>
              Toggle whether administrators can modify products or the catalog operates in view-only mode.
            </p>
          </div>
          <span
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              backgroundColor: status.backgroundColor,
              color: status.color,
              fontWeight: 600,
            }}
          >
            {status.label}
          </span>
        </div>
      </header>

      <form action={formAction} style={{ display: 'grid', gap: '1rem' }}>
        <fieldset
          style={{
            display: 'grid',
            gap: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.85rem',
            padding: '1rem',
          }}
        >
          <legend style={{ fontWeight: 600 }}>Select operating mode</legend>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="writes_enabled"
              value="true"
              defaultChecked={writesEnabled}
              onChange={() => setSelection('true')}
            />
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Allow admin writes</p>
              <p style={{ margin: '0.2rem 0 0', color: '#6b7280' }}>
                Administrators can create and update brands, products, variants, and images.
              </p>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="writes_enabled"
              value="false"
              defaultChecked={!writesEnabled}
              onChange={() => setSelection('false')}
            />
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Switch to view-only</p>
              <p style={{ margin: '0.2rem 0 0', color: '#6b7280' }}>
                Prevent new writes while keeping the catalog publicly accessible with existing inventory.
              </p>
            </div>
          </label>
        </fieldset>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <FormMessage state={state} />
            {viewOnlySelected ? (
              <p style={{ margin: 0, color: '#b45309', fontWeight: 600 }}>{VIEW_ONLY_MESSAGE}</p>
            ) : null}
          </div>
          <SubmitButton pendingLabel="Updating…">Apply mode</SubmitButton>
        </div>
      </form>
    </section>
  );
}
