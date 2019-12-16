import axios from "axios";


async function verify_jwt() {
  console.log("verifying jwt...");
  const verified = await axios.get("/api/auth/verify")
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

  return verified;
}

export default verify_jwt;
