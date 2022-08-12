const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const profile = require('../../models/Profile');

//////////////GET ROUTES///////////////////

//@Route  GET api/profiles
//@desc   Get All Profiles
//@access Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
        console.error(err.message);
        res.status(400).send('Server Error');
    }
});

//@Route  GET api/profile/me
//@desc   Get Current Users Profile
//@access Private

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        res.json(profile);
    }
    catch {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@Route  GET api/profile/user/:user_id
//@desc   Get Profile by user ID
//@access Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) res.status(400).json({ msg: 'There is no profile found' });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'there is no profile found' })
        }
        res.status(500).send('Server Error');
    }
});

//////////////POST ROUTES///////////////////

//@Route  POST api/profile
//@desc   Create or update user profile
//@access Private

router.post('/', [auth, [
    check('status', 'Status is required')
        .not()
        .isEmpty(),
    check('skills', 'Skills is required')
        .not()
        .isEmpty()
]
],
    async (req, res) => {
        errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        //Build Social object
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id })

            if (profile) {
                //update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );

                return res.json(profile);
            }

            //Create Profile
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    })

//@Route  DELETE api/profiles
//@desc   Delete profile, user & posts
//@access Private

router.delete('/', auth, async (req, res) => {
    try {
        //Remove profile
        await Profile.findOneAndRemove({ user : req.user.id } );

        // Remove user
        await User.findOneAndRemove({ _id : req.user.id });

        res.json({msg: 'User deleted' });

    } catch (err) {
        console.error(err.message);
        res.status(400).send('Server Error');
    }
});






module.exports = router;