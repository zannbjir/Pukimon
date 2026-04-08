require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const app = express();

// Setting View Engine menggunakan EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware untuk file statis (opsional jika Anda punya folder public)
app.use(express.static(path.join(__dirname, '../public')));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Fungsi bantu kirim data Supabase ke EJS
const renderPage = (res, page) => {
    res.render(page, { 
        supabaseUrl: process.env.SUPABASE_URL, 
        supabaseKey: process.env.SUPABASE_ANON_KEY 
    });
};

app.get('/auth/google', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${protocol}://${host}` }
    });
    if (error) return res.status(400).send(error.message);
    res.redirect(data.url);
});

// Route untuk GitHub Login
app.get('/auth/github', async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}/` 
        : `http://localhost:3000/`,
    },
  });

  if (error) return res.status(400).send(error.message);
  res.redirect(data.url);
});

app.get('/', (req, res) => renderPage(res, 'lobby'));
app.get('/chess', (req, res) => renderPage(res, 'chees'));
app.get('/workshop', (req, res) => renderPage(res, 'workshop'));
app.get('/profile', (req, res) => renderPage(res, 'profile'));

// Redirect untuk route lama .html ke route baru (opsional)
app.get('/lobby.html', (req, res) => res.redirect('/'));
app.get('/Chess.html', (req, res) => res.redirect('/chess'));
app.get('/Fix.html', (req, res) => res.redirect('/workshop'));
app.get('/Pf.html', (req, res) => res.redirect('/profile'));



// Export aplikasi untuk Vercel Serverless
module.exports = app;

// Listen port jika dijalankan lokal (npm start)
const PORT = process.env.PORT || 8000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}