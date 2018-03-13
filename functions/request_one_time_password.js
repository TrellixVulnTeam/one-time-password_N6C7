const admin = require('firebase-admin');
const twilio = require('./twilio');

module.exports = function(req, res) {
  if (!req.body.phone) {
    return res.status(423).send({ error: 'You must provide a phone number' });
  }

  const phone = String(req.body.phone).replace(/[^\d]/g, '');

  admin.auth().getUser(phone)
    .then(userRecord => {
      const code = Math.floor((Math.random() * 8999 + 1000));

      twilio.messages.create({
        body: 'Your code is ' + code,
        to: phone,
        from: '+13602180968'
      }, (err) => {
        if (err) { return res.status(422).send(err + ' :Twilio API Error'); }

        admin.database().ref('users/' + phone)
          .update({ code: code, codeValid: true }, () => {
            res.send({ success: true });
          });
      })
    })
    .catch((err) => {
      res.status(424).send(err + ' :Error getting user');
    });
}