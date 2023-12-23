const express = require('express');
const app = express();
const mongoose = require('mongoose');
const user = require('../src/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = 'uma_vez_flamengo_sempre_flamengo';

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/guiaapi');
// carregando model em uma variavel
let User = mongoose.model('User', user);

app.get('/', (req, res) => {
  res.json({});
});

app.post('/user', async (req, res) => {
  let { name, email, password } = req.body;

  if (name == '' || email == '' || password == '') {
    res.sendStatus(400);
    return;
  }

  try {
    let user = await User.findOne({ email: email });

    if (user != undefined) {
      res.statusCode = 400;
      res.json({ error: 'E-mail já cadastrado!' });
      return;
    }

    let salt = await bcrypt.genSalt(10);
    let hashPassword = await bcrypt.hash(password, salt);

    let newUser = new User({
      name,
      email,
      password: hashPassword,
    });
    await newUser.save();
    res.json({ email });
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post('/auth', async (req, res) => {
  let { email, password } = req.body;

  let user = await User.findOne({ email: email });
  if (user == undefined) {
    res.statusCode = 403;
    res.json({ errors: { email: 'E-mail não cadstrado!' } });
    return;
  }

  let isPasswordRight = await bcrypt.compare(password, user.password);
  if (!isPasswordRight) {
    res.statusCode = 403;
    res.json({ errors: { password: 'Senha incorreta!' } });
    return;
  }

  jwt.sign(
    { email, name: user.name, id: user._id },
    jwtSecret,
    { expiresIn: '48h' },
    (err, token) => {
      if (err) {
        res.sendStatus(500);
        console.log(err);
      } else {
        res.json({ token });
      }
    },
  );
});

app.delete('/user/:email', async (req, res) => {
  await User.deleteOne({ email: req.params.email });
  res.sendStatus(200);
});

module.exports = app;
