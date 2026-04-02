import React, { useState } from 'react';
import { useResources } from './hooks/useResources';

const ORANGE = '#F97316';
const BG_DARK = '#000000';
const CARD_BG = '#111111';
const CARD_BORDER = '#222222';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#A1A1AA';
const NEED_COLOR = '#EF4444';
const OFFER_COLOR = '#22C55E';

function ResourceBoard({ onBack }) {
  const { resources, loading, addResource } = useResources();
  const [formType, setFormType] = useState('need');
  const [formCategory, setFormCategory] = useState('food');
  const [formDescription, setFormDescription] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredResources =
    activeFilter === 'all'
      ? resources
      : resources.filter((r) => r.type === activeFilter);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDescription.trim()) return;
    await addResource({
      type: formType,
      category: formCategory,
      description: formDescription.trim(),
    });
    setFormDescription('');
  };

  /* ---- shared style helpers ---- */
  const pillBtn = (active) => ({
    flex: 1,
    padding: '10px 0',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: active ? ORANGE : '#1E1E1E',
    color: active ? '#fff' : TEXT_SECONDARY,
  });

  const filterBtn = (active) => ({
    padding: '8px 20px',
    border: active ? `1px solid ${ORANGE}` : `1px solid ${CARD_BORDER}`,
    borderRadius: '20px',
    background: active ? 'rgba(249,115,22,0.15)' : 'transparent',
    color: active ? ORANGE : TEXT_SECONDARY,
    fontWeight: 500,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  if (loading) {
    return (
      <div style={{ background: BG_DARK, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: TEXT_SECONDARY, fontSize: '1.1rem' }}>Loading resources…</p>
      </div>
    );
  }

  return (
    <div style={{ background: BG_DARK, minHeight: '100vh', color: TEXT_PRIMARY, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ========== HEADER ========== */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: `1px solid ${CARD_BORDER}`,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: TEXT_PRIMARY, fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px',
        }} aria-label="Go back">
          &#8592;
        </button>
        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Resource Board</h1>
        <span style={{ color: TEXT_SECONDARY, fontSize: '0.85rem' }}>
          {resources.length} {resources.length === 1 ? 'post' : 'posts'}
        </span>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>

        {/* ========== FORM ========== */}
        <form onSubmit={handleSubmit} style={{
          background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: '16px', padding: '24px', marginBottom: '28px',
        }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button type="button" style={pillBtn(formType === 'need')} onClick={() => setFormType('need')}>
              I Need Help
            </button>
            <button type="button" style={pillBtn(formType === 'offer')} onClick={() => setFormType('offer')}>
              I Can Offer
            </button>
          </div>

          {/* Category select */}
          <select
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', marginBottom: '16px', borderRadius: '8px',
              border: `1px solid ${CARD_BORDER}`, background: '#1E1E1E', color: TEXT_PRIMARY,
              fontSize: '0.95rem', appearance: 'auto', cursor: 'pointer',
            }}
          >
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="medicine">Medicine</option>
            <option value="shelter">Shelter</option>
            <option value="other">Other</option>
          </select>

          {/* Description textarea */}
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Describe what you need or can offer..."
            rows={3}
            style={{
              width: '100%', padding: '12px 14px', marginBottom: '16px', borderRadius: '8px',
              border: `1px solid ${CARD_BORDER}`, background: '#1E1E1E', color: TEXT_PRIMARY,
              fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit',
            }}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={!formDescription.trim()}
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '8px',
              background: formDescription.trim() ? ORANGE : '#333', color: '#fff',
              fontSize: '1rem', fontWeight: 600, cursor: formDescription.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            Post Resource
          </button>
        </form>

        {/* ========== FILTER BAR ========== */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'need', 'offer'].map((f) => (
            <button key={f} type="button" style={filterBtn(activeFilter === f)} onClick={() => setActiveFilter(f)}>
              {f === 'all' ? 'All' : f === 'need' ? 'Need' : 'Offer'}
            </button>
          ))}
        </div>

        {/* ========== RESOURCE LIST ========== */}
        {filteredResources.length === 0 ? (
          <p style={{ textAlign: 'center', color: TEXT_SECONDARY, marginTop: '40px', fontSize: '1rem' }}>
            No resources posted yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredResources.map((r) => (
              <div key={r.id} style={{
                background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: '12px', padding: '20px',
                borderLeft: `4px solid ${r.type === 'need' ? NEED_COLOR : OFFER_COLOR}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  {/* Badge */}
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px',
                    background: r.type === 'need' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                    color: r.type === 'need' ? NEED_COLOR : OFFER_COLOR,
                  }}>
                    {r.type === 'need' ? 'NEED' : 'OFFER'}
                  </span>
                  {/* Category */}
                  <span style={{ fontSize: '0.85rem', color: TEXT_SECONDARY, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {r.category}
                  </span>
                </div>
                {/* Description */}
                <p style={{ margin: '0 0 10px', fontSize: '1rem', lineHeight: 1.5, color: TEXT_PRIMARY }}>
                  {r.description}
                </p>
                {/* Timestamp */}
                <span style={{ fontSize: '0.8rem', color: TEXT_SECONDARY }}>
                  {new Date(r.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceBoard;
