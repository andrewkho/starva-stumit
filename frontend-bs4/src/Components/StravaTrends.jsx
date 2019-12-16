import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {Redirect} from "react-router";

import {convertToPace, get_activities} from "../Utils/Activities";
import Spinner from "react-bootstrap/Spinner";
import Plot from "react-plotly.js";


class StravaTrends extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authorized: true,
      activities: [],
      loading: false,
      metric: true,
      start: new Date(2000, 1, 1),
      end: new Date(),
    };
    this.update_activities = this.update_activities.bind(this);
    this.hr_pace_plot = this.hr_pace_plot.bind(this);
  }

  hr_pace_plot() {
    console.log(`Plotting trends for ${this.state.activities.length} activities...`);

    const avg_hr = {};
    const avg_pace = {};
    const dist = {};
    const time = {};
    const date = {};
    const elevation = {};
    const pace_per_hr = {};
    const activity_names = {};

    const date_list = this.state.activities.map((a) => a.start_date_local);
    const max_date = Math.max(...date_list);
    const min_date = Math.min(...date_list);

    for (var i = 0; i <  this.state.activities.length; i++) {
      const a = this.state.activities[i];
      if (a.type !== 'Run' || !a.has_heartrate || a.id === 2498179930) {
        continue;
      }

      if (!(a.workout_type in date)) {
        date[a.workout_type] = [];
        avg_hr[a.workout_type] = [];
        avg_pace[a.workout_type] = [];
        elevation[a.workout_type] = [];
        dist[a.workout_type] = [];
        time[a.workout_type] = [];
        activity_names[a.workout_type] = [];
        pace_per_hr[a.workout_type] = [];
      }
      date[a.workout_type].push(a.start_date_local);

      avg_hr[a.workout_type].push(a.average_heartrate);
      avg_pace[a.workout_type].push(convertToPace(a.average_speed, true));
      elevation[a.workout_type].push(a.total_elevation_gain);
      dist[a.workout_type].push(a.distance / 1000);
      time[a.workout_type].push(a.moving_time);
      activity_names[a.workout_type].push(a.name);

      pace_per_hr[a.workout_type].push(
        47 * a.average_speed / a.average_heartrate
      );

    }

    const workout_types = {
      0: 'Default Run',
      1: 'Race',
      2: 'Long Run',
      3: 'Workout',
    };

    const workout_colours = {
      0: 'rgba(156, 165, 255, 1.0)',
      1: 'rgba(0, 0, 0, 1.0)',
      2: 'rgba(255, 165, 156, 1.0)',
      3: 'rgba(165, 255, 156, 1.0)',
    };

    const data = Object.keys(workout_types).map((i) => {
      return {
        type: 'scatter',
        x: date[i],
        y: pace_per_hr[i],
        hovertext: activity_names[i],
        mode: 'markers',
        name: workout_types[i],
        marker: {
          color: workout_colours[i],
          symbol: 'circle',
          size: dist[i],
        },
      };
    });

    const layout = {
      title: 'Aerobic Efficiency [metres per beat]',

      width: '1000',
      height: '800',
      xaxis: {
        autorange: true,
        range: [min_date, max_date],
        rangeselector: {
          buttons: [
            {
              count: 1,
              label: '1m',
              step: 'month',
              stepmode: 'backward'
            },
            {
              count: 6,
              label: '6m',
              step: 'month',
              stepmode: 'backward'
            },
            {step: 'all'}
          ]},
        rangeslider: {range: [min_date, max_date]},
        type: 'date'
      },
    };

    return (
      <Plot
        data={data}
        layout={layout}
      />
    )
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

    return activities;
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
          {this.state.loading ? <Row> <Spinner animation="border"/> </Row>: ""}
          <Row>
            {!this.state.loading ? this.hr_pace_plot() : ""}
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
