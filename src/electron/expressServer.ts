const express = require('express');
import { getCoversPath } from './util/appPaths';
const app = express();
const port = 3030; // Port number for your static server

// Serve static files from the 'public' directory
app.use(express.static(getCoversPath()));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
