const express = require('express');
const app = express();
const mongoose = require('mongoose');
const joi = require("@hapi/joi");
const { userValidation } = require('./validation users/user.schema')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var crypto = require('crypto');
var key = 'password';
var algo = 'aes256';

const jwt = require('jsonwebtoken')
jwtKey = "jwt";

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './upload');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().getTime() + file.originalname);
    }
});

const upload = multer({ storage: storage });

const User = require('./models/task');
const { adduserValidation } = require('./validation users/user.validation')

mongoose.connect('mongodb+srv://Mrudul:mrudul123@cluster0.kgiee.mongodb.net/tutorials?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.post('/login', jsonParser, function(req, res) {
    User.findOne({ email: req.body.email }).then((data) => {
        var decipher = crypto.createDecipher(algo, key);
        var decrypted = decipher.update(data.password, 'hex', 'utf-8') +
            decipher.final('utf-8');
        if (decrypted == req.body.password) {
            jwt.sign({ data }, jwtKey, { expiresIn: '300s' }, (err, token) => {
                res.status(200).json({ token });
            })
        }
    })
})

app.get('/listusers', verifyToken, function(req, res) {
    User.find().then((data) => {
        res.status(201).json(data)
    })
})

app.get('/getuser/:_id', verifyToken, function(req, res) {
    User.find({ _id: req.params._id }).then((data) => {
        res.status(201).json(data)
    })
})

app.post('/adduser', jsonParser, verifyRole, upload.single('profileimage'), function(req, res) {
    var cipher = crypto.createCipher(algo, key);
    var encrypted = cipher.update(req.body.password, 'utf-8', 'hex') +
        cipher.final('hex');
    const data = new User({
        _id: new mongoose.Types.ObjectId(),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: encrypted,
        country: req.body.country,
        city: req.body.city,
        mobile: req.body.mobile,
        profileimage: req.file.path,
        role: req.body.role
    })
    const { error } = userValidation(req.body);
    if (error) {
        res.send(error.details[0].message);
    } else {
        res.json({ message: "Data Successfully Saved!" });
        data.save().then((result) => {
            res.json(result)
        }).catch((error) => console.log(error))
    }
})

app.delete('/deluser/:_id', function(req, res) {
    User.deleteOne({ _id: mongoose.Types.ObjectId(req.params._id) }).then((result) => {
        res.status(200).json(result)
    }).catch((error) => {
        console.log(error)
    })

})

app.put('/upuser/:firstname', jsonParser, function(req, res) {
    User.updateOne({ firstname: req.params.firstname }, { $set: { email: req.body.email } }).then((result) => {
        res.status(201).json(result)
    }).catch((error) => console.log(error))
})

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        req.token = bearer[1];
        jwt.verify(req.token, jwtKey, (err, data) => {
            if (err) {
                res.json({ result: err })
            } else {
                next();
            }
        })
    } else {
        res.send({ "result": "token not provided" })
    }
}

function verifyRole(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        req.token = bearer[1];
        jwt.verify(req.token, jwtKey, (err, data) => {
            if (err) {
                res.json({ result: err })
            } else {
                if (data.data.role == "Admin") {
                    next();
                } else {
                    res.send({ "result": "Only Admin can do this & You are General" })
                }
            }
        })
    } else {
        res.send({ "result": "token not provided" })
    }
}


app.listen(6000);

// app.get('/search/:firstname',function(req,res){
//     var regex = new RegExp(req.params.firstname,'i');
//     User.find({firstname:regex}).then((result)=>{
//         res.status(200).json(result)
//     }).catch((error)=>console.log(error))
// })

// User.find({},function(err,users){
//     if(err) console.log(err);
//     console.log(users);
// })