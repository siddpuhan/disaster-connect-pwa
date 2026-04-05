import React, { useState } from 'react';
import { useResources } from './hooks/useResources';

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

  if (loading) {
    return (
      <div style={{ background: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#A1A1AA', fontSize: '1.1rem' }}>Loading resources…</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#000000', 
      minHeight: '100vh', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: "'Inter', system-ui, sans-serif" 
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '480px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflow: 'hidden' 
      }}>
        
        {/* HEADER */}
        <header style={{
          width: '100%',
          background: '#0A0A0A',
          borderBottom: '1px solid #1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          boxSizing: 'border-box'
        }}>
          <button onClick={onBack} style={{
            background: 'transparent',
            border: '1px solid #222',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1A1A1A'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            &#8592;
          </button>
          <h1 style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: '18px' }}>Resource Board</h1>
          <span style={{
            background: '#1A1A1A',
            color: '#A1A1AA',
            fontSize: '12px',
            borderRadius: '20px',
            padding: '4px 12px'
          }}>
            {resources.length}
          </span>
        </header>

        {/* FORM SECTION WRAPPER */}
        <div style={{ padding: '0' }}>
          <form onSubmit={handleSubmit} style={{
            background: '#0D0D0D',
            border: '1px solid #1A1A1A',
            borderRadius: '14px',
            padding: '20px',
            margin: '16px',
            boxSizing: 'border-box'
          }}>
            
            {/* TYPE TOGGLE */}
            <div style={{
              background: '#0A0A0A',
              border: '1px solid #1A1A1A',
              borderRadius: '10px',
              padding: '4px',
              display: 'flex',
              marginBottom: '16px'
            }}>
              <button type="button" onClick={() => setFormType('need')} style={{
                flex: 1,
                background: formType === 'need' ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: formType === 'need' ? '#EF4444' : '#A1A1AA',
                fontWeight: formType === 'need' ? 500 : 400,
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                I Need Help
              </button>
              <button type="button" onClick={() => setFormType('offer')} style={{
                flex: 1,
                background: formType === 'offer' ? 'rgba(34,197,94,0.15)' : 'transparent',
                color: formType === 'offer' ? '#22C55E' : '#A1A1AA',
                fontWeight: formType === 'offer' ? 500 : 400,
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                I Can Offer
              </button>
            </div>

            {/* CATEGORY SELECT */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                color: '#A1A1AA', fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px'
              }}>Category</div>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0A0A0A',
                  border: '1px solid #222222',
                  borderRadius: '10px',
                  color: 'white',
                  padding: '12px 16px',
                  fontSize: '14px',
                  appearance: 'auto',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.outline = 'none'; }}
                onBlur={(e) => { e.target.style.borderColor = '#222222'; }}
              >
                <option value="food">🍞 Food</option>
                <option value="water">💧 Water</option>
                <option value="medicine">💊 Medicine</option>
                <option value="shelter">🏠 Shelter</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            {/* DESCRIPTION TEXTAREA */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                color: '#A1A1AA', fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px'
              }}>Description</div>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe what you need or can offer..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  resize: 'vertical',
                  background: '#0A0A0A',
                  border: '1px solid #222222',
                  borderRadius: '10px',
                  color: 'white',
                  padding: '12px 16px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.outline = 'none'; }}
                onBlur={(e) => { e.target.style.borderColor = '#222222'; }}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={!formDescription.trim()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: formDescription.trim() ? 'pointer' : 'not-allowed',
                background: formDescription.trim() ? '#F97316' : '#1A1A1A',
                color: formDescription.trim() ? 'black' : '#444444',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (formDescription.trim()) e.currentTarget.style.background = '#EA6C00'; }}
              onMouseOut={(e) => { if (formDescription.trim()) e.currentTarget.style.background = '#F97316'; }}
            >
              Post Resource
            </button>
          </form>

          {/* FILTER BAR */}
          <div style={{ display: 'flex', gap: '8px', padding: '0 16px', marginBottom: '16px' }}>
            {['all', 'need', 'offer'].map((f) => (
              <button key={f} type="button" onClick={() => setActiveFilter(f)} style={{
                background: activeFilter === f ? '#F97316' : '#111111',
                border: `1px solid ${activeFilter === f ? '#F97316' : '#222'}`,
                color: activeFilter === f ? 'black' : '#A1A1AA',
                borderRadius: '20px',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: activeFilter === f ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (activeFilter !== f) e.currentTarget.style.borderColor = '#444'; }}
              onMouseOut={(e) => { if (activeFilter !== f) e.currentTarget.style.borderColor = '#222'; }}
              >
                {f === 'all' ? 'All' : f === 'need' ? 'Need' : 'Offer'}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE LIST */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '20px'
        }}>
          {filteredResources.length === 0 ? (
            /* EMPTY STATE */
            <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '80px', height: '80px', background: '#111', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
              }}></div>
              <p style={{ color: '#444', fontSize: '15px', margin: 0 }}>No resources posted yet</p>
              <p style={{ color: '#333', fontSize: '13px', marginTop: '4px' }}>Be the first to post a resource</p>
            </div>
          ) : (
            <div>
              {filteredResources.map((r) => (
                /* RESOURCE CARDS */
                <div key={r.id} style={{
                  background: '#0D0D0D', border: '1px solid #1A1A1A', borderRadius: '14px',
                  padding: '16px', margin: '0 16px 10px 16px', transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        background: r.type === 'need' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                        color: r.type === 'need' ? '#EF4444' : '#22C55E',
                        border: `1px solid ${r.type === 'need' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                        borderRadius: '6px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        {r.type === 'need' ? 'NEED' : 'OFFER'}
                      </span>
                      <span style={{
                        color: '#A1A1AA', fontSize: '12px', marginLeft: '8px', 
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        {r.category}
                      </span>
                    </div>
                    <span style={{ color: '#444444', fontSize: '11px' }}>
                      {new Date(r.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ color: '#E5E5E5', fontSize: '14px', lineHeight: '1.6', marginTop: '10px', marginBottom: 0 }}>
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222222; border-radius: 2px; }
        textarea::placeholder { color: #444444; }
      `}</style>
    </div>
  );
}

export default ResourceBoard;
