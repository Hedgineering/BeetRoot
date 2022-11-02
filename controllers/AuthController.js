const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../server/database/schemas/User')

const register = (res, res, next) => {
    const salt = bcrypt.genSalt(10)
    //Increase the amount in gensalt to increase security but will slow down registration significantly.
    const hashed_password = bcrypt.hash(req.body.password, salt)
    let user = new User({
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: hashed_password,
        status: "User"
    })
    user.save().then(user => res.json({message: 'User added successfully'}))
    .catch(error => {res.json({message: 'fuck'})})
}

const login = (req, res, next) => {
    const user = User.find(user => user.name = req.res.name)
    if (user == null){
        return res.status(400).send('Cannot find user')
    }
    try{
        if(bcrypt.compare(req.body.password, user.password)){
            res.send('Login Success')
        } else {
            res.send('Login Failure')
        }
    }catch{
        res.status(500).send()
    }
}

module.exports = {
    register
}