const express = require('express');
const app = express();
const memberRoutes = require('./routes/memberRoutes');
app.use('/api/members', memberRoutes);
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path)
  }
})
console.log("Member routes:");
memberRoutes.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(Object.keys(r.route.methods).join(', ') + ' ' + r.route.path);
  }
});
