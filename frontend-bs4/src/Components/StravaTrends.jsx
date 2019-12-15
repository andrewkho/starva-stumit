import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Redirect} from "react-router";
import axios from "axios";
import qs from "query-string";

import {get_activities} from "../Utils/Activities";


class StravaTrends extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authorized: true,
      activities: [],
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

  render() {
    if (this.state.authorized) {
      return (
        <Container fluid>
          <Row>
            <Col>
              {!this.state.activity ?
                <h1>Loading...</h1> :
                <div>
                  <Row>Distance {this.getDistance()}</Row>
                  <Row>Moving Time {this.getMovingTime()}</Row>
                  <Row>Avg. Pace {this.getAveragePace()}</Row>
                  {this.state.activity.has_heartrate ?
                    <Row>Avg. HR {this.state.activity.average_heartrate}</Row> :
                    ''}
                  <Row>{this.state.activity.description}</Row>
                </div>
              }
            </Col>
            <Col>
              {this.state.streams && this.state.activity ? this.hr_plot() : ''}
            </Col>
            <Col>
              {this.state.streams && this.state.activity && this.state.zones ? this.hr_zone_plot() : ''}
            </Col>
          </Row>
        </Container>
      )
    } else {
      return (
        <Redirect to="/"/>
      )
    }
  }
}

export default StravaTrends;
