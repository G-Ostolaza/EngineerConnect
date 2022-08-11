const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../../middleware/auth');
const Profile = require("../../models/profile");
const User = require("../../models/User");


//@Route  GET api/profile/me
//@desc   Get Current Users Profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);

        if(!profile) {
            return res.status(400).json({ msg: "There is no profile for this user" });
        }
        res.json(profile);
    }   
    catch {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;