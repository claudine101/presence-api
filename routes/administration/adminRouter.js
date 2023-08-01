const express = require('express');

const volume_routes = require('./volume_admin.Router')

const adminRouter=express.Router();

adminRouter.use('/volume',volume_routes)



module.exports = adminRouter