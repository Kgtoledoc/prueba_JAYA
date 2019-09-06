const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const fs = require('fs');


const Users = require('./models/Users');
const port = 3000;
const app = express();
const SECRET_KEY = 'secretkey123456';


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send("Test JAYA")
})

 // Login
app.post('/login', (req, res) => {

    var username = req.body.username;
    var password = req.body.password;

    Users.findOne({ username: username }, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Server error!');
        }
        if (!user) {
            return res.status(404).send('Something is wrong');
        } else {
            const resultPassword = bcrypt.compareSync(password, user.password);
            if (resultPassword) {

                const expiresIn = 24 * 60 * 60;
                const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: expiresIn });
                const dataUser = {
                    username: user.username,
                    email: user.email,
                    accessToken: accessToken,
                    expiresIn: expiresIn
                }
                res.send({ dataUser, message: 'Login successfully!' })
            } else {
                res.status(404).send({ message: 'Something is wrong!' });
            }
        }
    })

})
// Signup api
app.post('/signup', (req, res) => {

    var username = req.body.username;
    var password = bcrypt.hashSync(req.body.password);

    const user = new Users();
    user.username = username;
    user.password = password;

    user.save((err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Server error');
        }

        const expiresIn = 24 * 60 * 60;
        const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: expiresIn });

        const dataUser = {
            username: user.username,
            email: user.email,
            accessToken: accessToken,
            expiresIn: expiresIn
        }
        // response 
        return res.status(200).send({ dataUser, message: 'Successful registration' });
    })

})

// Ascendent array
app.get('/asc', verifyToken, (req, res) => {
    jwt.verify(req.token, SECRET_KEY, (err, authUser) => {
        if (err) {
            return res.sendStatus(403);
        }
        else {            

            fs.readFile('./assets/original.txt', function(err, data) {
                if(err) throw err;
                var array = data.toString().split(";\r\n");
                array.pop();
                for(i in array) {
                    var newArray = array[i].split();
                    
                    console.log(newArray);
                    
                }   

                res.json({
                    message: 'Access granted',
                    array
                })
            });

              
        }

    })
})

// Descenden array
app.get('/des', verifyToken, (req, res) => {
    jwt.verify(req.token, SECRET_KEY, (err, authUser) => {
        if (err) {
            return res.sendStatus(403);
        }
        else {
            res.status(200).send({
                message: 'Access granted',
                authUser
            });
        }

    })


})
app.get('/mix', verifyToken, (req, res) => {
    jwt.verify(req.token, SECRET_KEY, (err, authUser) => {
        if(err){
            return res.sendStatus(403);
        }
        else {
            res.json({
                message: 'Access granted',
                authUser
            })
        }
        
    })
})

// FORMAT TOKEN
// Authorization: Bearer <access key>

function verifyToken(req, res, next) {
    // Get auth header value
    const token = req.headers['x-access-token'];
    console.log(token);
    if (!token) {

        return res.status(401).send({
            token,
            auth: false,
            message: 'No token provided'
        })


    } else {
        req.token = token;
        next();
    }
}

app.listen(port, () => {

    console.log(`Server listening on port ${port}`);
})

