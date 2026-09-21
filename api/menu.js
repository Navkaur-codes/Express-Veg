// Express Vegetarian — à la carte menu API (Vercel serverless function)
// GET  /api/menu  -> list available menu items
// POST /api/menu  -> add a menu item

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Only build the client if both vars exist, so a missing env var gives a
// clear message instead of a crash at startup.
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

module.exports = async function handler(req, res) {
  if (!supabase) {
    return res.status(500).json({
      error:
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY ' +
        'in your environment variables and redeploy.',
    });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, category, price, available } = req.body || {};

    if (!name || !category || price === undefined) {
      return res
        .status(400)
        .json({ error: 'name, category and price are required' });
    }

    if (isNaN(Number(price))) {
      return res.status(400).json({ error: 'price must be a number' });
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name,
        category,
        price: Number(price),
        available: available === undefined ? true : Boolean(available),
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
