import axios from "axios";
import React, { Component } from "react";

const host = "http://localhost";
const verify_route = "/api/auth/verify";

async function verify_jwt() {
  console.log("verifying jwt...");
  const verified = await axios.get(host + verify_route)
    .then((response) => {
      console.log("Successfully verified jwt");
      console.log(response);
      return true;
    })
    .catch((error) => {
      console.log("Failed to verify JWT ");
      console.log(error);
      return false;
    })
  ;
  // const verified = await fetch(host + verify_route, {
  //   method: 'GET', // *GET, POST, PUT, DELETE, etc.
  //   credentials: 'same-origin',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // })
  //   .then((response) => {
  //     return response.ok;
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     return false;
  //   });
  //
  return verified;
}

export default verify_jwt;
