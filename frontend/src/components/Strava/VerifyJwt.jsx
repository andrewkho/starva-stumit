import React, { Component } from "react";
import { Button } from "react-bootstrap";

const host = "http://localhost";
const verify_route = "/api/auth/verify";

async function verify_jwt() {
  console.log("verifying jwt...");
  const verified = await fetch(host + verify_route, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      return response.ok;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });

  return verified;
}

export default verify_jwt;
