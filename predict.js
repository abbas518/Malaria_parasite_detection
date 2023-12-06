const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');

const app = express();
const upload = multer({ dest: 'uploads/' });

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

    // Resize the uploaded image to 128x128
    const resizedImageBuffer = await resizeImage(req.file.path);

    // Load the model
    const model = await loadModel();

    // Convert resized image buffer to Tensor
    const imageTensor = tf.node.decodeImage(resizedImageBuffer, 3);

    // Perform model inference on the preprocessed image
    const prediction = model.predict(imageTensor);

    // Get the prediction result (example: convert Tensor to readable data)
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
