import axios from "axios";
import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";


class ActivityCard extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    console.log("activity clicked");
    console.log(`Activity clicked ${this.props.activity.id}`);
    // const zones = axios.post("http://localhost/api/v1/get_activity_zones", {
    //const zones = axios.post("http://localhost/api/v1/get_activity_details", {
    const zones = axios.post("http://localhost/api/v1/get_activity_streams", {
      "activity_id": this.props.activity.id,
      "streamtypes": [
        'velocity_smooth',
        'grade_smooth',
        'distance',
        'heartrate',
        'time',
      ],
    }).then(resp => {
      console.log(JSON.stringify(resp.data))
    }).catch(err => {
      console.error(err)
    })
  }

  round_to(x, digits) {
    const a = Math.pow(10, digits);
    return (Math.round(x * a) / a).toFixed(digits)
  }

  getDistance() {
    if (this.props.metric) {
      return `${this.round_to(this.props.activity.distance/1000, 2)} km`
    } else {
      return `${this.round_to(this.props.activity.distance/1600, 2)} mi`
    }
  }

  getMovingTime() {
    const total_seconds = this.props.activity.moving_time;
    let hours = Math.floor(total_seconds / 3600);
    let minutes = Math.floor((total_seconds - 3600*hours) / 60);
    let seconds = total_seconds - 3600*hours + 60*minutes;

    if (hours < 10) {hours = `0${hours}`} else {hours = `${hours}`}
    if (minutes < 10) {minutes = `0${minutes}`} else {minutes = `${minutes}`}
    if (seconds < 10) {seconds = `0${seconds}`} else {seconds = `${seconds}`}

    return `${hours}:${minutes}:${seconds}`;
  }

  getAveragePace() {
    // Convert m/s to min/km for metric, min/mi for
    const mps = this.props.activity.average_speed;
    if (this.props.activity.type === "Run") {
      // 1000m / km * 1 min / 60 s / m / s = min / km
      const min_per_km = 1000 / 60 / mps;
      let pace;
      if (this.props.metric) {
        pace = min_per_km;
      } else {
        pace = min_per_km * 1.6;
      }
      let mins = Math.floor(pace);
      let seconds = Math.round((pace - mins) * 60);
      if (mins < 10) { mins = `0${mins}`; } else {mins = `${mins}`}
      if (seconds < 10) { seconds = `0${seconds}`} else {seconds = `${seconds}`}
      return `${mins}:${seconds} mins / ${this.props.metric ? 'km' : 'mi'}`;
    }
    else {
      // 1 km / 1000 m * 3600 s / 1 h * m / s = km / h
      const kph = 3600/1000 * mps;
      if (this.props.metric) {
        return `${this.round_to(kph, 1)} km / h`
      } else {
        return `${this.round_to(kph/1.6, 1)} mi / h`
      }
    }
  }

  render() {
    return(
      <Card style={{ width: '18rem' }}>
        <Card.Img variant="top" src="holder.js/100px180" />
        <Card.Body>
          <Card.Title>{this.props.activity.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {this.props.activity.type} on {new Date(this.props.activity.start_date_local).toLocaleDateString()}
          </Card.Subtitle>
          <Card.Text>
            <ListGroup className="list-group-flush">
              <ListGroupItem>Distance {this.getDistance()}</ListGroupItem>
              <ListGroupItem>Moving Time {this.getMovingTime()}</ListGroupItem>
              <ListGroupItem>Avg. Pace {this.getAveragePace()}</ListGroupItem>
              {this.props.activity.has_heartrate ?
                <ListGroupItem>Avg. HR {this.props.activity.average_heartrate}</ListGroupItem> :
                ''}
            </ListGroup>
            {/*<ul>*/}
            {/*  <li>Distance {this.getDistance()}</li>*/}
            {/*  <li>Moving Time {this.getMovingTime()}</li>*/}
            {/*  <li>Avg. Pace {this.getAveragePace()}</li>*/}
            {/*  {this.props.activity.has_heartrate ?*/}
            {/*    <li>Avg. HR {this.props.activity.average_heartrate}</li> :*/}
            {/*    ''}*/}
            {/*</ul>*/}
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }

}

export default ActivityCard;
