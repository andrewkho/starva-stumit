import axios from "axios";


async function verify_jwt() {
  console.log("verifying jwt...");
  let verified = await axios.get("/api/auth/verify")
    .then((response) => {
      console.log("Successfully verified jwt");
      console.log(response);
      return true;
    })
    .catch((error) => {
      console.log("Failed to verify JWT ");
      console.log(error);
      return false;
    });

  if (!verified) {
    return false;
  }

  console.log("Checking user details");
  verified = await axios.get("/api/auth/me")
    .then((response) => {
      if (!response.data.me) {
        console.log("Missing user!");
        return false;
      }
      console.log("Success!");
      return true;
    })
    .catch((error) => {
      console.log("Error!");
      console.log(error);
      return false
    });

  return verified;
}

export default verify_jwt;
