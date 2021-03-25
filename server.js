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

const Registration = require('./models/registration');

mongoConnect(() => {
  console.log(__dirname)
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

  app.get('/user/:username', async (req, res) => {
    //const user = await User.getOneByUsername(req.params.username);
    //res.send(user);
  });

  app.get('/center/registration', async (req, res) => {
    const allRegistrations = await Registration.getAll();

    res.send(allRegistrations);
  });

  app.get('/center/registration/:email', async (req, res) => {
    const allRegistrations = await Registration.getAll();

    res.send(allRegistrations);
  });

  app.post('/center/registration', async (req, res) => {

    // console.log(req.body.civility)

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    const filesName = ['studientCheckFile', 'proofResidence', 'medicalCertificate'];
    let filePath = {};

    let numberFilesUploaded = 0;

    filesName.forEach(fileName => {
      let sampleFile;
      let uploadPath = 'files/registration/' + req.body.email + '/';


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
      studientCheck: req.body.studientCheck,
      studientCheckFilePath:  filePath['studientCheckFile'],
      proofResidenceFilPath: filePath['proofResidence'],
      medicalCertificateFilePath: filePath['medicalCertificate'],
    });

    await registration.save();

    res.send(numberFilesUploaded + ' file(s) uploaded!');
  });


  //server.listen(process.env.PORT || 3000, 'localhost');
  server.listen(3001, '0.0.0.0');
});
