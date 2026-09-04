const routes = require('./routes/memberRoutes');
routes.stack.forEach(r => {
  if(r.route && r.route.path === '/bulk-upload') {
    console.log(r.route.stack.map(layer => layer.name));
  }
});
