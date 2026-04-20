// ============================================================
// WADE STRONG — SUPABASE CLIENT CONFIG
// Shared across all pages
// ============================================================
const SUPABASE_URL = 'https://wkdedbyaeildwsqvmtfn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_24bNg4MvV96RwpSWol466w_ZZ_w3hcO';

// Simple fetch wrapper for Supabase REST API
const db = {
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) { const e = await res.text(); console.error('Supabase insert error:', e); return null; }
    return await res.json();
  },

  async select(table, filters = {}, options = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${options.select || '*'}`;
    Object.entries(filters).forEach(([k, v]) => url += `&${k}=eq.${encodeURIComponent(v)}`);
    if (options.order) url += `&order=${options.order}`;
    if (options.limit) url += `&limit=${options.limit}`;
    const res = await fetch(url, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) { const e = await res.text(); console.error('Supabase select error:', e); return null; }
    return await res.json();
  },

  async upsert(table, data, onConflict = 'email') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) { const e = await res.text(); console.error('Supabase upsert error:', e); return null; }
    return await res.json();
  },

  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) { const e = await res.text(); console.error('Supabase update error:', e); return null; }
    return await res.json();
  }
};
