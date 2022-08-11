const express = require('express');
const router = express.Router();
const path = require('path');


//@Route  GET api/profile
//@desc   Test route
//@access Public
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
    // res.render('../../index.html')
});

module.exports = router;