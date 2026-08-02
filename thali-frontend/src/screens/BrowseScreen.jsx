import { useState } from 'react';
import { C, F } from '../tokens';
import MealCard from '../components/meals/MealCard';
import MealDrawer from '../components/meals/MealDrawer';
import { meals } from '../data/mockData';

const FILTERS = ['All', 'Veg', 'Under ₹150', 'South Indian', 'Non-veg', 'Vegan'];

export default function BrowseScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = meals.filter(m => {
    const q = search.toLowerCase();
    const s = !q || m.name.toLowerCase().includes(q) || m.cuisine.toLowerCase().includes(q);
    const f =
      activeFilter === 'All' ? true :
      activeFilter === 'Veg' ? m.type === 'veg' :
      activeFilter === 'Under ₹150' ? m.price < 150 :
      activeFilter === 'South Indian' ? m.tag === 'South Indian' :
      activeFilter === 'Non-veg' ? m.type === 'non-veg' :
      activeFilter === 'Vegan' ? m.type === 'vegan' : true;
    return s && f;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      {/* Header */}
      <header style={{
        padding: '56px 20px 14px',
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(15,14,12,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <h1 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 26, fontWeight: 700, color: C.cream, marginBottom: 14 }}>Browse</h1>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
            width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search meals or cuisine…"
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '11px 14px 11px 38px',
              fontFamily: F.body, fontSize: 14, color: C.cream,
              outline: 'none',
            }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {FILTERS.map(f => {
            const on = f === activeFilter;
            return (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                flexShrink: 0, padding: '7px 14px',
                fontFamily: F.body, fontSize: 12, fontWeight: on ? 600 : 400,
                color: on ? C.bg : C.muted,
                background: on ? C.saffron : 'rgba(255,255,255,0.05)',
                border: `1px solid ${on ? C.saffron : C.border}`,
                borderRadius: 99, cursor: 'pointer', transition: 'all 0.15s',
              }}>{f}</button>
            );
          })}
        </div>
      </header>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 88px' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: C.muted }}>
            <p style={{ fontFamily: F.body, fontSize: 14 }}>No meals found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filtered.map(m => <MealCard key={m.id} meal={m} onClick={setSelected} />)}
          </div>
        )}
      </div>

      <MealDrawer meal={selected} onClose={() => setSelected(null)} onAdd={() => {}} />
    </div>
  );
}
