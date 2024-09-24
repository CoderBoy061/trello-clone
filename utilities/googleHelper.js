import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client();
import dotenv from "dotenv";
dotenv.config();
export const verifyGoogleToken = async (idToken) => {
  try {

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: [process.env.CLIENT_ID],
    });
    return ticket.getPayload();
  } catch (err) {
    console.log(err);
  }
};
export const googleClient = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage"
);
