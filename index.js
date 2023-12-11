const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');
const path = require('path');

const app = express();

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Load the .h5 model
async function loadModel() {
  const model = await tf.loadLayersModel('model.h5');
  return model;
}

// Resize image to 128x128
async function resizeImage(filePath) {
  const resizedImageBuffer = await sharp(filePath)
    .resize(128, 128)
    .toBuffer();
  return resizedImageBuffer;
}

// Handle POST request for image prediction
app.post('/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No image uploaded.');
    }

    // Process the uploaded image using the model
    const resizedImageBuffer = await resizeImage(req.file.buffer);
    const model = await loadModel();
    const imageTensor = tf.node.decodeImage(resizedImageBuffer, 3);
    const prediction = model.predict(imageTensor);
    const result = prediction.dataSync();

    // Send the prediction result back to the client
    res.json({ prediction: result });
  } catch (error) {
    console.error('Error predicting image:', error);
    res.status(500).send('Error predicting image.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
