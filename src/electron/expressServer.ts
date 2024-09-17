const express = require('express');
const path = require('path');
const app = express();
const port = 3030; // Port number for your static server

// Serve static files from the 'public' directory
app.use(express.static(path.join(process.env.APPDATA, 'Electron', 'covers')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
