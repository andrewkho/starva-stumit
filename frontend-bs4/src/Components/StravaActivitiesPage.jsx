import axios from "axios";
import React from 'react';
import {Container, Navbar, Nav} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ActivityCard from "./ActivityCard";
import CardColumns from "react-bootstrap/CardColumns";
import Spinner from "react-bootstrap/Spinner";
import {Map, TileLayer} from "react-leaflet";
import {Link} from "react-router-dom";


const host = "http://localhost";
const get_activities_route = "/api/v1/get_activities";


function getSundayMidnight(monday) {
  const end = new Date(monday);
  end.setDate(monday.getDate() + 6);
  end.setHours(23, 59, 59);

  return end;
}

function getMonday(d) {
  /**
   * Date.getDay() : Weekday
   * Date.getDate() : Day of Month
   */
  const day_num = d.getDay();  // Day of month
  const diff = d.getDate() - day_num + (day_num === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dateToEpochSeconds(day) {
  return Math.round(day.getTime() / 1000);
}

async function get_activities(start, end) {
  const start_seconds = dateToEpochSeconds(start);
  const end_seconds = dateToEpochSeconds(end);

  console.log("start end " + start_seconds + " " + end_seconds);

  const activities = await axios.post(host + get_activities_route, {
    start: start_seconds,
    end: end_seconds,
  }).then((response) => {
    console.log("Got response " + JSON.stringify(response));
    return response.data;
  }).then((data) => {
    console.log("Got data " + JSON.stringify(data));
    return data
  }).catch((error) => {
    console.log(error)
  });

  return activities;
}

class StravaActivitiesPage extends React.Component {
  constructor(props) {
    super(props);

    const start = getMonday(new Date());
    const end = getSundayMidnight(start);

    this.state = {
      activities: [],
      start: start,
      end: end,
      loading: false,
      metric: true,
    };
    this.handlePrev = this.handlePrev.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.update_activities = this.update_activities.bind(this);
  }

  async update_activities(start, end) {
    this.setState({
      loading: true,
    });

    console.log(`start: ${start}, end: ${end}`);
    const activities_data = await get_activities(start, end);
    const activities = [];
    activities_data.forEach(a => activities.push(a));
    activities.sort((x, y) => new Date(x.start_date_local) - new Date(y.start_date_local));

    this.setState({
      loading: false,
    });

    return activities
  }

  async componentDidMount() {
    const activities = await this.update_activities(
      this.state.start, this.state.end);
    this.setState({
      activities: activities,
    });
  }

  async handlePrev() {
    console.log('handlePrev');
    let start = new Date(this.state.start);
    start.setDate(start.getDate() - 7);
    let end = new Date(this.state.end);
    end.setDate(end.getDate() - 7);

    this.setState({
      start: start,
      end: end,
      activities: await this.update_activities(start, end),
    });
  }

  async handleNext() {
    console.log('handleNext');
    let start = new Date(this.state.start);
    start.setDate(start.getDate() + 7);
    let end = new Date(this.state.end);
    end.setDate(end.getDate() + 7);

    this.setState({
      start: start,
      end: end,
      activities: await this.update_activities(start, end),
    });
  }

  render() {
    return (
      <Container>
        <Navbar collapseOnSelect expand="lg" bg="light" variant="light" fluid>
          <Navbar.Brand className="mr-auto">Activities</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
          <Nav className="mr-auto">
            <Nav.Item>
              {this.state.start.toDateString()} - {this.state.end.toDateString()}
            </Nav.Item>
          </Nav>
          <Nav.Item>
            {this.state.loading ? <Spinner animation="border" /> : ""}
          </Nav.Item>
          <Nav.Item>
            <ButtonGroup>
              <Button onClick={this.handlePrev}>Prev</Button>
              <Button onClick={this.handleNext}>Next</Button>
            </ButtonGroup>
          </Nav.Item>
        </Navbar>
        <CardColumns>
          {
            this.state.activities.map((activity) => {
              return (
                  <Link to={`/strava/activity?activity_id=${activity.id}&metric=${this.state.metric}`}>
                    <ActivityCard activity={activity} metric={this.state.metric}/>
                  </Link>
              )
            })
          }
        </CardColumns>
      </Container>
    )
  }
}

export default StravaActivitiesPage;
