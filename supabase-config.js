// ============================================================
// WADE STRONG — SUPABASE CLIENT CONFIG
// Shared across all pages
// ============================================================
const SUPABASE_URL = 'https://wkdedbyaeildwsqvmtfn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_24bNg4MvV96RwpSWol466w_ZZ_w3hcO';

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
    if (!res.ok) { const e = await res.text(); console.error('db.insert error:', e); return null; }
    return await res.json();
  },

  async select(table, filters = {}, options = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${options.select || '*'}`;
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url += `&${k}=eq.${encodeURIComponent(v)}`;
    });
    if (options.order) url += `&order=${options.order}`;
    if (options.limit) url += `&limit=${options.limit}`;
    const res = await fetch(url, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) { const e = await res.text(); console.error('db.select error:', e); return null; }
    return await res.json();
  },

  // Patch rows matching filters
  async patch(table, filters, data) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?`;
    url += Object.entries(filters).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) { const e = await res.text(); console.error('db.patch error:', e); return null; }
    return await res.json();
  },

  // Save or update: try PATCH first, if no rows exist INSERT
  async save(table, matchFilters, data) {
    // Try PATCH first
    const patched = await this.patch(table, matchFilters, data);
    if (patched && patched.length > 0) return patched;
    // No existing row — INSERT
    return await this.insert(table, { ...matchFilters, ...data });
  },

  async upsert(table, data, onConflict = 'id') {
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
    if (!res.ok) { const e = await res.text(); console.error('db.upsert error:', e); return null; }
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
    if (!res.ok) { const e = await res.text(); console.error('db.update error:', e); return null; }
    return await res.json();
  },

  async delete(table, filters) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?`;
    url += Object.entries(filters).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) { const e = await res.text(); console.error('db.delete error:', e); return null; }
    return true;
  }
};
