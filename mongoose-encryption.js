const Promise = require('bluebird');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
// https://www.npmjs.com/package/mongoose-encryption
// last publish : 6 months ago

const userSchema = new mongoose.Schema({
    name: String,
    age: Number
    // whatever else
});

userSchema.plugin(encrypt, { secret: 'Some unguessable secret' });
// This adds _ct and _ac fields to the schema, as well as pre 'init' and pre 'save' middleware,
// and encrypt, decrypt, sign, and authenticate instance methods

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
        // "find works transparently (though you cannot query fields that are encrypted)"
        console.log('findByName:', savedDataInDb);
    })
    .then(() => {
        mongoose.disconnect();
    });

db.on('error', console.error.bind(console, 'connection error:'));