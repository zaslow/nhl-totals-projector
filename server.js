const express = require('express');
const mustacheExpress = require('mustache-express');
const { projectTotals } = require('.');

const app = express();

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname);

app.get('/', async (_req, res) => {
  res.render('index', await projectTotals()); // Render the 'index.mustache' template
});

app.listen(3000, () => console.log('Server started on port 3000'));
