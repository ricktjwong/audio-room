require('dotenv').config();
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const twilioAccountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.REACT_APP_API_SID;
const twilioApiSecret = process.env.REACT_APP_API_SECRET;

function tokenGenerator(identity, room) {
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);

  // Assign identity to the token
  token.identity = identity;

  // Grant the access token Twilio Video capabilities
  const grant = new VideoGrant();
  grant.room = room;
  token.addGrant(grant);

  // Serialize the token to a JWT string
  return token.toJwt();
}

module.exports = tokenGenerator;