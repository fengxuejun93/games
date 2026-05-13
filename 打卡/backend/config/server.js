const app = require('./app');
const routes = require('../routes');

routes(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});