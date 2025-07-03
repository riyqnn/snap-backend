const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const nftRoutes = require('./routes/nftRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const verifyRoutes = require('./routes/verifyRoutes');

const app = express();
