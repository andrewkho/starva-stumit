import axios from "axios";
import React, { Component } from 'react';
import {Row, Col, Grid} from "react-bootstrap";
import Button from "react-bootstrap/lib/Button";

import DateRangePicker from 'react-bootstrap-daterangepicker';
// you will need the css that comes with bootstrap@3. if you are using
// a tool like webpack, you can do the following:
import 'bootstrap/dist/css/bootstrap.css';
// you will also need the css that comes with bootstrap-daterangepicker
import 'bootstrap-daterangepicker/daterangepicker.css';

import ActivitySummaryButton from "components/Strava/Activities/ActivitySummaryButton";

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

  console.log("start end " + start_seconds + " " + " " + end_seconds);

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

class StravaActivitiesPage extends Component {
  constructor(props) {
    super(props);

    const start = getMonday(new Date());
    const end = getSundayMidnight(start);

    this.state = {
      activities: [],
      start: start,
      end: end,
    };
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  async update_activities() {
    const activities_data = await get_activities(this.state.start, this.state.end);
    const activities = [];
    activities_data.forEach(a => activities.push(a));
    console.log(JSON.stringify(activities));
    this.setState({
      activities: activities
    })
  }

  async componentDidMount() {
    await this.update_activities()
  }

  async handleDateChange(event, picker) {
    console.log("handleDateChange called");
    const start = getMonday(new Date(picker.startDate));
    const end = getSundayMidnight(start);

    this.setState({
        start: start,
        end: end,
      });
    await this.update_activities();
  }

  render() {
    return (
      <Grid fluid>
        <Row>
          Select Week
          <DateRangePicker
            weekStart={1}
            startDate={this.state.start}
            endDate={this.state.end}
            onEvent={this.handleDateChange}
          >
            <Button>
              {this.state.start.toLocaleDateString()} -
              {this.state.end.toLocaleDateString()}
            </Button>
          </DateRangePicker>
        </Row>
      <Row>
        Activities List
      </Row>
        {
          this.state.activities.map((activity) => {
            return (
              <Row>
                <ActivitySummaryButton activity={activity} metric={true}/>
              </Row>
            )
          })
        }
      </Grid>
    )
  }
}

export default StravaActivitiesPage;
