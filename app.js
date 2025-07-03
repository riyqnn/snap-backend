require('dotenv').config();
const express = require('express');
const brandRoutes = require('./routes/brandRoutes');

const app = express();
app.use(express.json());

app.use('/api/brand', brandRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
