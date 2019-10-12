import axios from "axios";
import React from 'react';
import {Container, Navbar, Nav} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ActivityCard from "./ActivityCard";
import CardColumns from "react-bootstrap/CardColumns";
import Spinner from "react-bootstrap/Spinner";
import {Redirect, Link} from "react-router-dom";
import qs from "query-string";


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

class StravaActivitiesPage extends React.Component {
  constructor(props) {
    super(props);

    let start, end;
    if (!this.props.location || !this.props.location.search) {
      start = getMonday(new Date());
      end = getSundayMidnight(start);
    } else {
      console.log("processing query params");
      const query_params = qs.parse(this.props.location.search);

      start = new Date(0);
      start.setUTCSeconds(query_params.start);
      end = new Date(0);
      end.setUTCSeconds(query_params.end);
    }

    this.state = {
      authorized: true,
      activities: [],
      start: start,
      end: end,
      loading: false,
      metric: true,
    };
    this.getPrev = this.getPrev.bind(this);
    this.getNext = this.getNext.bind(this);
    this.update_activities = this.update_activities.bind(this);
  }

  async get_activities(start, end) {
    const start_seconds = dateToEpochSeconds(start);
    const end_seconds = dateToEpochSeconds(end);

    console.log("start end " + start_seconds + " " + end_seconds);

    const activities = await axios.post("/api/v1/get_activities", {
      start: start_seconds,
      end: end_seconds,
    }).then((response) => {
      return response.data;
    }).catch((error) => {
      console.log(error);
      this.setState({
        authorized: false,
      });
    });

    return activities;
  }

  async update_activities(start, end) {
    this.setState({
      loading: true,
    });

    console.log(`start: ${start}, end: ${end}`);
    const activities_data = await this.get_activities(start, end);
    const activities = [];
    if (activities_data && activities_data.length > 0) {
      activities_data.forEach(a => activities.push(a));
      activities.sort((x, y) => new Date(x.start_date_local) - new Date(y.start_date_local));
    }

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

  getPrev() {
    console.log('handlePrev');
    let start = new Date(this.state.start);
    start.setDate(start.getDate() - 7);
    let end = new Date(this.state.end);
    end.setDate(end.getDate() - 7);

    const start_secs = Math.round(start.getTime() / 1000);
    const end_secs = Math.round(end.getTime() / 1000);
    const path = `/strava?start=${start_secs}&end=${end_secs}`;
    console.log(path);
    return path
  }

  getNext() {
    console.log('handleNext');
    let start = new Date(this.state.start);
    start.setDate(start.getDate() + 7);
    let end = new Date(this.state.end);
    end.setDate(end.getDate() + 7);

    const start_secs = Math.round(start.getTime() / 1000);
    const end_secs = Math.round(end.getTime() / 1000);
    const path = `/strava?start=${start_secs}&end=${end_secs}`;
    console.log(path);
    return path;
  }

  render() {
    if (this.state.authorized) {
      return (
        <Container>
          <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
            <Navbar.Brand className="mr-auto">Activities</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
            <Nav className="mr-auto">
              <Nav.Item>
                {this.state.start.toDateString()} - {this.state.end.toDateString()}
              </Nav.Item>
            </Nav>
            <Nav.Item>
              {this.state.loading ? <Spinner animation="border"/> : ""}
            </Nav.Item>
            <Nav.Item>
              <ButtonGroup>
                <a href={this.getPrev()}>
                  <Button>Prev</Button>
                </a>
                <a href={this.getNext()}>
                  <Button>Next</Button>
                </a>
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
    } else {
      return (
        <Redirect to='/'/>
      )
    }
  }
}

export default StravaActivitiesPage;
