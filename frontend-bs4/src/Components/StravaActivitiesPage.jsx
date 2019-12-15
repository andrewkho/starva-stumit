import React from 'react';
import {Container} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ActivityCard from "./ActivityCard";
import CardColumns from "react-bootstrap/CardColumns";
import Spinner from "react-bootstrap/Spinner";
import {Link, Redirect} from "react-router-dom";
import qs from "query-string";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {get_activities} from "../Utils/Activities";


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
    return await get_activities(start, end)
      .then((data) => {
        return data;
      }).catch((error) => {
        console.log(error);
        this.setState({
          authorized: false,
        });
      });
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
    const path = `/strava/activities?start=${start_secs}&end=${end_secs}`;
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
    const path = `/strava/activities?start=${start_secs}&end=${end_secs}`;
    console.log(path);
    return path;
  }

  render() {
    if (this.state.authorized) {
      return (
        <Container>
          <br/>
          <Row>
            <Col> {this.state.start.toDateString()} - {this.state.end.toDateString()} </Col>
            <Col> {this.state.loading ? <Spinner animation="border"/> : ""} </Col>
            <Col>
              <ButtonGroup>
                <a href={this.getPrev()}> <Button>Prev</Button> </a>
                <a href={this.getNext()}> <Button>Next</Button> </a>
              </ButtonGroup>
            </Col>
          </Row>
          <br />
          <Row>
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
          </Row>
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
