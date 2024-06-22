const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs-extra');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/compress', upload.single('pdf'), async (req, res) => {
  try {
    const { path: filePath, originalname } = req.file;

    const pdfDoc = await PDFDocument.load(await fs.readFile(filePath));
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

    const compressedFilePath = path.join('compressed', `compressed_${originalname}`);
    await fs.outputFile(compressedFilePath, pdfBytes);

    res.download(compressedFilePath, `compressed_${originalname}`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
      fs.remove(filePath);
      fs.remove(compressedFilePath);
    });
  } catch (error) {
    console.error('Error compressing PDF:', error);
    res.status(500).send('Error compressing PDF');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});