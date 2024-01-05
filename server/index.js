const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const pdfRoutes = require('./routes/pdfRoutes');
require('dotenv').config()
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/', pdfRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
