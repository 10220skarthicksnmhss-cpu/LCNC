import { useState, useEffect, useCallback } from 'react';
import { C, F } from '../tokens';
import MealCard from '../components/meals/MealCard';
import MealDrawer from '../components/meals/MealDrawer';
import { meals as mealsApi } from '../api/client';

const FILTERS = ['All', 'Veg', 'Under ₹150', 'South Indian', 'Non-veg', 'Vegan'];

export default function BrowseScreen() {
  const [search, setSearch]           = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected]       = useState(null);
  const [mealsList, setMealsList]     = useState([]);
  const [loading, setLoading]         = useState(true);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search: search || undefined, filter: activeFilter !== 'All' ? activeFilter : undefined };
      const res = await mealsApi.list(params);
      setMealsList(res.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    const t = setTimeout(fetchMeals, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchMeals]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      <header style={{
        padding: '56px 20px 14px',
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(15,14,12,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <h1 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 26, fontWeight: 700, color: C.cream, marginBottom: 14 }}>Browse</h1>

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
              fontFamily: F.body, fontSize: 14, color: C.cream, outline: 'none',
            }}
          />
        </div>

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

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 88px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40, color: C.muted, fontFamily: F.body, fontSize: 14 }}>
            Loading…
          </div>
        ) : mealsList.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: C.muted }}>
            <p style={{ fontFamily: F.body, fontSize: 14 }}>No meals found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {mealsList.map(m => <MealCard key={m.id} meal={m} onClick={setSelected} />)}
          </div>
        )}
      </div>

      <MealDrawer meal={selected} onClose={() => setSelected(null)} onAdd={() => {}} />
    </div>
  );
}
