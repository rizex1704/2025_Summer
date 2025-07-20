const router = require("express").Router();
const api = require("../api/test.js");
module.exports = app => {
    router.post('/gogo', api.gogo);

    app.use('/test', router);
}