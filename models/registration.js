const {getDb} = require('./../utils/database');
const objectId = require('mongodb').ObjectId

const COLLECTION_NAME = 'registration';

const STATUSES = [
  'INIT',
  'OK',
  'KO',
  'NEED_CHANGE'
]

class Registration {
  constructor({ civility, firstname, lastname, dateOfBirth, nationality, postalAddress, postalCode, city,
                country, phone, email, pictureAllowed, informationsEmailAllowed, informationsSmsAllowed,
                partnersAllowed, bookingConfirmAllowed, pass92Allowed, proofPaymentAllowed, alreadyLicenced,
                lisence, sportYear, clubLisenced, studientCheck, studientCheckFilePath, proofResidenceFilPath,
                medicalCertificateFilePath, stripeSessionId
              }) {
    this._id = null;

    this.status = STATUSES[0];
    this.civility = civility;
    this.lastname = lastname;
    this.firstname = firstname;
    this.dateOfBirth = dateOfBirth;
    this.nationality = nationality;
    this.postalAddress = postalAddress;
    this.postalCode = postalCode;
    this.city = city;
    this.country = country;
    this.phone = phone;
    this.email = email;
    this.pictureAllowed = pictureAllowed;
    this.informationsEmailAllowed = informationsEmailAllowed;
    this.informationsSmsAllowed = informationsSmsAllowed;
    this.partnersAllowed = partnersAllowed;
    this.bookingConfirmAllowed = bookingConfirmAllowed;
    this.pass92Allowed = pass92Allowed;
    this.proofPaymentAllowed = proofPaymentAllowed;
    this.alreadyLicenced = alreadyLicenced;
    this.lisence = lisence;
    this.sportYear = sportYear;
    this.clubLisenced = clubLisenced;
    this.studientCheck = studientCheck;
    this.studientCheckFilePath = studientCheckFilePath;
    this.proofResidenceFilPath = proofResidenceFilPath;
    this.medicalCertificateFilePath = medicalCertificateFilePath;
    this.stripeSessionId = stripeSessionId;
  }

  static async getAll() {
    const db = getDb();
    return db
      .collection(COLLECTION_NAME)
      .find()
      .toArray()
  }

  static async getOneById(id) {
    const db = getDb();
    return db.collection(COLLECTION_NAME)
      .findOne({"_id": objectId(id)});
  }

  static async getOneByUsername(username) {
    const db = getDb();
    return db.collection(COLLECTION_NAME)
      .findOne({username: username});
  }

  static async updateStatus(id, status) {
    const db = getDb();
    return db.collection(COLLECTION_NAME)
      .updateOne(
        { _id: objectId(id) },
        {
          $set:
            {
              status: status
            }
        }
      );
  }

  async save() {
    const db = getDb();

    if (this._id !== null) {
      return db.collection(COLLECTION_NAME).updateOne({"_id": objectId(this._id)}, {$set: this})
    } else {
      return db.collection(COLLECTION_NAME).insertOne(this)
    }
  }

  static async delete(id) {
    const db = getDb();

    return db.collection(COLLECTION_NAME).deleteOne({"_id": objectId(id)})
  }
}

module.exports = Registration;
