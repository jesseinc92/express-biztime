/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")
const companiesRoutes = require('./routes/companies');
const invoicesRoutes = require('./routes/invoices');
const industriesRoutes = require('./routes/industries');
const indCompRoutes = require('./routes/ind_comp');

app.use(express.json());


/** companies routes */

app.use('/companies', companiesRoutes);

/** invoices routes */

app.use('/invoices', invoicesRoutes);

/** industries routes */

app.use('/industries', industriesRoutes);

/** industries_companies routes */

app.use('/indcomp', indCompRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
