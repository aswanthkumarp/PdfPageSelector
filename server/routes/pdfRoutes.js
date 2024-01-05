const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const Pdf = require('../model/pdfSchema');

const storage = multer.memoryStorage();
const upload = multer({ storage });


const uploadMiddleware = upload.single('file');

router.post('/upload', (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
        console.error('Multer Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      const { buffer, originalname } = req.file;
      const dataBuffer = Buffer.from(buffer);
      const pdf = new Pdf({
        data: dataBuffer,
        filename: originalname,
      });
  
      await pdf.save();
  
      res.json({ filename: originalname });
  });
});

router.post('/create-pdf', async (req, res) => {
    const { originalPdf, selectedPages } = req.body;

  if (!originalPdf || !selectedPages) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const pdf = await Pdf.findOne({ filename: originalPdf });

  const existingPdfDoc = await PDFDocument.load(pdf.data);
  const newPdfDoc = await PDFDocument.create();

  for (const pageNumber of selectedPages) {
    const [copiedPage] = await newPdfDoc.copyPages(existingPdfDoc, [
      pageNumber - 1,
    ]);
    newPdfDoc.addPage(copiedPage);
  }

  const newPdfBytes = await newPdfDoc.save();

  const newPdf = new Pdf({
    data: Buffer.from(newPdfBytes),
    filename: 'newPdf.pdf',
  });

  await newPdf.save();

  res.json({ filename: 'newPdf.pdf' });
});

router.get('/download-current', async (req, res) => {
    try {
        const newPdf = await Pdf.findOne({}, {}, { sort: { _id: -1 } });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=newPdf.pdf');
        res.send(newPdf.data);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

router.post('/download-selected', async (req, res) => {
    try {
        const newPdf = await Pdf.findOne({}, {}, { sort: { _id: -1 } });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=selectedPagesPdf.pdf');
        res.send(newPdf.data);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

module.exports = router;
