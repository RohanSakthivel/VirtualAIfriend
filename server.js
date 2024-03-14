const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Parse JSON bodies
app.use(bodyParser.json());

// Define route handler for root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Route for handling messages and generating responses
app.post('/response', (req, res) => {
    const message = req.body.message;

    // Execute Python script to generate response
    exec(`python ./python_model/your_python_script.py "${message}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing Python script:', error);
            res.status(500).json({ error: 'Error generating response' });
        } else {
            const response = stdout.trim();
            setTimeout(() => {
                res.json({ response: response });
            }, 2000); // Send response after 2 seconds
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
