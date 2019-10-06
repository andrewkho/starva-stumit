/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import strava_logo from "assets/icons/strava-32.png"
import Strava from "views/Strava.jsx"

const dashboardRoutes = [
  {
    path: "/strava",
    name: "Strava",
    image: strava_logo,
    component: Strava,
    layout: "/admin"
  },
];

export default dashboardRoutes;
