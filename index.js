const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle image prediction
app.post('/predict', upload.single('image'), (req, res) => {
  // Process the uploaded image using your model
  // Replace this with your prediction logic

  // Example: Get the filename and send a random prediction
  if (req.file) {
    const prediction = Math.random() >= 0.5 ? 'Uninfected' : 'Parasitized'; // Random prediction example
    res.json({ prediction });
  } else {
    res.status(400).send('No image uploaded.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
