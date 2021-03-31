const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const helmet = require('helmet');
const {mongoConnect, getDb} = require('./utils/database');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Registration = require('./models/registration');

mongoConnect(() => {
  app.use('/files', express.static(__dirname + '/files'));

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  app.use(helmet());

  app.use(fileUpload());

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Content-Type', 'application/json');
    next()
  });

  const sockets = []
  const db = getDb();

  app.post('/user', async (req, res) => {
    const customer = await stripe.customers.create({
      email: 'test@test.com'
    })

    res.send(customer.id);
  });

  /* app.get('/checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      success_url: 'http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:8080',
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            product_data: {
              name: 'Adhésion jeu libre mars-août',
              images: [
                'https://images.unsplash.com/photo-1558365849-6ebd8b0454b2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
              ]
            },
            unit_amount: 31500,
            currency: 'eur'
          },
          quantity: 1
        }
      ]
    })

    // Save the Session Id in User collection
    res.send(session.id);
  }); */

  app.get('/user/:username', async (req, res) => {
    //const user = await User.getOneByUsername(req.params.username);
    //res.send(user);
  });

  app.get('/center/registration', async (req, res) => {
    const allRegistrations = await Registration.getAll();

    res.send(allRegistrations);
  });

  app.get('/center/registration/payment-status/:sessionId', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId)

    res.send(session);
  });

  app.post('/center/registration/status', async (req, res) => {
    const registration = await Registration.updateStatus(req.body.id, req.body.status);

    res.send(registration);
  });

  app.post('/center/registration', async (req, res) => {
    /* if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    } */

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: 'http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:8080',
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            product_data: {
              name: 'Adhésion jeu libre mars-août',
              images: [
                'https://images.unsplash.com/photo-1558365849-6ebd8b0454b2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
              ]
            },
            unit_amount: 31500,
            currency: 'eur'
          },
          quantity: 1
        }
      ]
    })

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    const filesName = ['studentFile', 'proofResidence', 'medicalCertificate'];
    let filePath = {};

    let numberFilesUploaded = 0;

    filesName.forEach(fileName => {
      let sampleFile;
      let uploadPath = 'files/registration/' + req.body.email + '/';

      if (!req.files || req.files[fileName] === undefined) {
        return;
      }

      sampleFile = req.files[fileName];

      fs.existsSync(uploadPath) || fs.mkdirSync(uploadPath);

      filePath[fileName] = uploadPath + sampleFile.name;

      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(filePath[fileName], function (err) {
        if (err) {
          console.log(err)

          return res.status(500).send(err);
        }

        numberFilesUploaded++;
      });
    })

    const registration = new Registration({
      civility: req.body.civility,
      lastname: req.body.lastname,
      firstname: req.body.firstname,
      dateOfBirth: req.body.dateOfBirth,
      nationality: req.body.nationality,
      postalAddress: req.body.postalAddress,
      postalCode: req.body.postalCode,
      city: req.body.city,
      country: req.body.country,
      phone: req.body.phone,
      informationsSmsAllowed: req.body.informationsSmsAllowed,
      email: req.body.email,
      informationsEmailAllowed: req.body.informationsEmailAllowed,
      pictureAllowed: req.body.pictureAllowed,
      partnersAllowed: req.body.partnersAllowed,
      bookingConfirmAllowed: req.body.bookingConfirmAllowed,
      pass92Allowed: req.body.pass92Allowed,
      proofPaymentAllowed: req.body.pass92Allowed,
      alreadyLicenced: req.body.alreadyLicenced,
      lisence: req.body.lisence,
      sportYear: req.body.sportYear,
      clubLisenced: req.body.clubLisenced,
      isStudent: req.body.isStudent,
      studientCheckFilePath:  filePath['studentFile'],
      proofResidenceFilPath: filePath['proofResidence'],
      medicalCertificateFilePath: filePath['medicalCertificate'],
      stripeSessionId: stripeSession.id
    });

    await registration.save();

    res.send(registration);
  });


  //server.listen(process.env.PORT || 3000, 'localhost');
  server.listen(3001, '0.0.0.0');
});

