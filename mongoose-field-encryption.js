const Promise = require('bluebird');
const mongoose = require('mongoose');
const { fieldEncryption: mongooseFieldEncryption, encryptAes256Ctr } = require("mongoose-field-encryption");
const crypto = require("crypto");
// https://www.npmjs.com/package/mongoose-field-encryption
// last publish : 3 months ago

const userSchema = new mongoose.Schema({
    name: String,
    age: Number
    // whatever else
});

userSchema.plugin(mongooseFieldEncryption, { fields: ['name'], secret: 'Some unguessable secret', useAes256Ctr: true });

const User = mongoose.model('User', userSchema);

// Usage

mongoose.connect('mongodb://localhost/mongoose-encryption');
db = mongoose.connection;

return Promise.fromCallback((cb) => db.once('open', cb))
    .then(() => {
        console.log('===🤸‍=== CONNECTED TO DB ===🤸‍===' + `\n`);

        const user = new User({ name: 'Robert', age: 7 });

        return Promise.fromCallback((cb) => user.save(cb));
    })
    .then((dataInDb) => {
        // console.log('dataInDb:', dataInDb);
        return dataInDb._id;
    })
    .then((id) => {
        return Promise.fromCallback((cb) => User.findById((id), cb));
    })
    .then((savedDataInDb) => {
        console.log('findById:', savedDataInDb);
        return Promise.fromCallback((cb) => User.find({name: 'Robert'}, cb));
    })
    .then((savedDataInDb) => {
        console.log(`\n\n`+'findByName(Robert):', savedDataInDb);
        
        return Promise.fromCallback((cb) => User.find({
            name: encryptAes256Ctr('Robert', 'Some unguessable secret')
        }, cb));
    })
    .then((savedDataInDb) => {
        console.log(`\n\n`+`findByName(Robert=${encryptAes256Ctr('Robert', 'Some unguessable secret')}):`, savedDataInDb);

        return Promise.fromCallback((cb) => User.find({
            name: { $regex: encryptAes256Ctr('Rob', 'Some unguessable secret') }
        }, cb));
    })
    .then((savedDataInDb) => {
        console.log(`\n\n`+`findByName(Rob=${encryptAes256Ctr('Rob', 'Some unguessable secret')}):`, savedDataInDb);
    })
    .then(() => {
        mongoose.disconnect();
    });

db.on('error', console.error.bind(console, 'connection error:'));