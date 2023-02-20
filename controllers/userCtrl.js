const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body
      const user = await Users.findOne({ email })
      if (user) return res.status(500).json({ msg: "The email already exists." })
      if (password.length < 6)
        return res.status(400).json({ msg: "The Password is weak" })
      const passwordHash = await bcrypt.hash(password, 10)

      // res.json({password, passwordHash})
      const newUser = new Users({
        name, email, password: passwordHash
      })
      await newUser.save()
      const accesstoken = createAccessToken({ id: newUser._id })
      const refreshtoken = createRefreshToken({ id: newUser._id })
      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh-token'
      })
      res.json({ accesstoken })
      //  return(res.status(400).json({msg:"Register Success"}))
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }

  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email })
      if (!user) return res.status(400).json({ msg: "User does not exist" })
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) return res.status(400).json({ msg: "Incorrect Password" })
      const accesstoken = createAccessToken({ id: user._id })
      const refreshtoken = createRefreshToken({ id: user._id })
      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh-token'
      })
      res.json({ accesstoken })
      //  res.json({msg:"Login Successful!"})

    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', { path: '/user/refresh-token' })
      return res.json({ msg: "Logged out" })
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }, getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select('-password')
      if (!user) return res.status(500).json({ msg: "User does not exist" })
      res.json(user)
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      console.log(rf_token)
      if (!rf_token) return res.status(400).json({ msg: "Please Login" });
      jwt.verify(rf_token, process.env.REFRESH_SECRET, (err, user) => {
        if (err) return res.status(400).json({ msg: "Please Login" })
        const accesstoken = createAccessToken({ id: user.id })
        res.json({ user, accesstoken })
      })
      // res.json({ rf_token })
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  addCart: async (req, res) => {
    try {

      const user = await Users.findById(req.user.id)
      if (!user) return res.status(400).json({ msg: "User does not exists." })
      await Users.findOneAndUpdate({ _id: req.user.id }, {
        cart: req.body.cart
      })
      return res.json({ msg: "Added to cart" })
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
}
const createAccessToken = (user) => {
  return jwt.sign(user, process.env.SIGN_SECRET, { expiresIn: '200d' })
}
const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_SECRET, { expiresIn: '200d' })
}

module.exports = userCtrl