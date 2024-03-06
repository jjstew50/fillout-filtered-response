// routes/responses.js

var express = require('express');
var router = express.Router();
const ResponseController = require('../controllers/responseController');

router.get('/:formId/filteredResponses', 
    ResponseController.getResponses
);

module.exports = router;
