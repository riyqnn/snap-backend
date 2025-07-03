const pool = require('./db'); // asumsi file db.js tadi

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  } finally {
    await pool.end(); // tutup koneksi biar clean
  }
}

testConnection();
