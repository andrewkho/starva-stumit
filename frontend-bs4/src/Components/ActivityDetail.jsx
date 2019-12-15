import axios from "axios";
import React, { Component } from "react";
import polyUtil from 'polyline-encoded';
import Container from "react-bootstrap/Container";
import qs from "query-string";
import Row from "react-bootstrap/Row";
import Plot from 'react-plotly.js';
import Col from "react-bootstrap/Col";
import { Redirect } from "react-router-dom";


class ActivityDetail extends Component {
  constructor(props) {
    super(props);
    const query_params = qs.parse(this.props.location.search);
    this.state = {
      authorized: true,
      activity_id: query_params.activity_id,
      activity: null,
      streams: null,
      zones: null,
      loading: true,
      metric: query_params.metric,
    };
    this.convertToPace = this.convertToPace.bind(this);
  }

  async componentDidMount() {
    console.log(`activity_id: ${this.state.activity_id}`);
    axios.post("/api/v1/get_activity_details", {
      "activity_id": this.state.activity_id,
    }).then(resp => {
      this.setState({
        activity: resp.data,
        loading: false,
      });

      this.load_map()
    }).catch(err => {
      console.error(err);
      this.setState({
        authorized: false,
      });
    });
    axios.post("/api/v1/get_activity_streams", {
      "activity_id": this.state.activity_id,
      "streamtypes": [
        'velocity_smooth',
        'grade_smooth',
        'distance',
        'heartrate',
        'time',
        'temp',
        'moving',
        'cadence',
        'watts',
        'altitude',
        'latlng',
      ],
    }).then(resp => {
      console.log('fetched streams');
      this.setState({
        streams: resp.data,
      })
    }).catch(err => {
      console.error(err);
      this.setState({
        authorized: false,
      })
    });

    axios.post("/api/v1/get_athlete_zones"
    ).then(resp => {
      console.log('fetched zones: ' + JSON.stringify(resp.data));
      this.setState({
        zones: resp.data,
      })
    }).catch(err => {
      console.error(err);
      this.setState({
        authorized: false,
      });
    });
  }

  round_to(x, digits) {
    const a = Math.pow(10, digits);
    return (Math.round(x * a) / a).toFixed(digits)
  }

  getDistance() {
    if (this.state.metric) {
      return `${this.round_to(this.state.activity.distance/1000, 2)} km`
    } else {
      return `${this.round_to(this.state.activity.distance/1600, 2)} mi`
    }
  }

  getMovingTime() {
    const total_seconds = this.state.activity.moving_time;
    let hours = Math.floor(total_seconds / 3600);
    let minutes = Math.floor((total_seconds - 3600*hours) / 60);
    let seconds = total_seconds - 3600*hours + 60*minutes;

    if (hours < 10) {hours = `0${hours}`} else {hours = `${hours}`}
    if (minutes < 10) {minutes = `0${minutes}`} else {minutes = `${minutes}`}
    if (seconds < 10) {seconds = `0${seconds}`} else {seconds = `${seconds}`}

    return `${hours}:${minutes}:${seconds}`;
  }

  convertToPace(mps, metric) {
      // 1000m / km * 1 min / 60 s / m / s = min / km
      const min_per_km = 1000 / 60 / mps;
      let pace;
      if (this.state.metric) {
        pace = min_per_km;
      } else {
        pace = min_per_km * 1.6;
      }
      return pace;
  }

  convertToSpeed(mps, metric){
    // 1 km / 1000 m * 3600 s / 1 h * m / s = km / h
    const kph = 3600/1000 * mps;
    if (metric) {
      return kph;
    } else {
      return kph / 1.6;
    }
  }

  getAveragePace() {
    // Convert m/s to min/km for metric, min/mi for
    const mps = this.state.activity.average_speed;
    if (this.state.activity.type === 'Run') {
      const pace = this.convertToPace(mps, this.state.metric);
      let mins = Math.floor(pace);
      let seconds = Math.round((pace - mins) * 60);
      if (mins < 10) {
        mins = `0${mins}`;
      } else {
        mins = `${mins}`
      }
      if (seconds < 10) {
        seconds = `0${seconds}`
      } else {
        seconds = `${seconds}`
      }
      return `${mins}:${seconds} mins / ${this.state.metric ? 'km' : 'mi'}`;
    } else {
      const speed = this.convertToSpeed(mps, this.state.metric);
      if (this.state.metric) {
        return `${this.round_to(speed, 1)} km / h`
      } else {
        return `${this.round_to(speed, 1)} mi / h`
      }
    }
  }

  load_map() {
    // const center = [55.609818, 13.003286];
    const script = document.createElement('script');
    script.src = process.env.PUBLIC_URL + '/tomtom-sdk/tomtom.min.js';
    document.body.appendChild(script);
    script.async = true;
    console.log('add polyline to map');
    const latlngs = polyUtil.decode(this.state.activity.map.polyline);

    script.onload = function () {
      const pl = window.tomtom.L.polyline(latlngs);
      const pl_bounds = pl.getBounds();
      const centre = [
        (pl_bounds._northEast.lat + pl_bounds._southWest.lat) / 2,
        (pl_bounds._northEast.lng + pl_bounds._southWest.lng) / 2,
      ];
      console.log(pl_bounds);
      console.log(centre);
      let map = window.tomtom.L.map('map', {
        source: 'vector',
        key: '9p8KAUamPjZiFTObd29KDLojlhDr4qgr',
        center: centre,
        basePath: process.env.PUBLIC_URL + '/tomtom-sdk',
        zoom: 15,
        zoomControl: true,
        width: '100vw',
        height: '100vh',
      });

      pl.addTo(map);
      map.fitBounds(pl.getBounds());
    }
  }

  hr_plot() {
    const x = this.state.streams.distance.data.map(u => u/1000);
    const velocity_name = this.state.activity.type === 'Run' ? 'Pace' : 'Speed';
    const max_pace = Math.max(...this.state.streams.velocity_smooth.data);
    const min_pace = Math.min(...this.state.streams.velocity_smooth.data);
    const max_hr = Math.max(...this.state.streams.heartrate.data);
    const min_hr = Math.min(...this.state.streams.heartrate.data);

    console.log(`${min_hr}, ${max_hr}, ${min_pace}, ${max_pace}`);

    const heartrate_data = [];
    const pace_data = [];
    const pace_data_filt = [];
    //const _pace_smooth = this.state.streams.velocity_smooth.data.map(this.convertToPace);
    //const _pace_smooth_filt = this.state.streams.velocity_smooth.data_filtered.map(this.convertToPace);
    const _pace_smooth = this.state.streams.velocity_smooth.data;
    const _pace_smooth_filt = this.state.streams.velocity_smooth.data_filtered;
    for (var i = 0; i < this.state.streams.moving.original_size; i++) {
      if (this.state.streams.moving.data[i]) {
        heartrate_data.push(this.state.streams.heartrate.data[i]);
        pace_data.push(_pace_smooth[i]);
        pace_data_filt.push(_pace_smooth_filt[i]);
      }
    }

    const pace_ticks = [2, 3, 4, 5, 6, 7, 8];
    function pace_to_mps(pace) {
      return 1000 / 60 / pace;
    }
    const mps_ticks = pace_ticks.map(pace_to_mps);

    const plot_data = [
      {
        name: 'Heart Rate',
        type: 'line',
        x: x,
        //y: this.state.streams.heartrate.data,
        y: heartrate_data,
        marker: {color: 'red'},
      },
      {
        name: velocity_name,
        type: 'scatter',
        x: x,
        // y: this.state.streams.velocity_smooth.data.map(this.convertToPace),
        y: pace_data,
        hovertext: pace_data.map(function(x) {return 1000 / 60 / x;}),
        yaxis: 'y2',
        marker: {color: 'grey'},
      },
      {
        name: velocity_name + ' filtered',
        type: 'scatter',
        x: x,
        y: pace_data_filt,
        hovertext: pace_data_filt.map(function(x) {return 1000 / 60 / x;}),
        yaxis: 'y2',
        marker: {color: 'blue'},
      },
    ];

    const layout = {
      title: 'Stream data',
      width: "60vw",
      height: "40vh",
      yaxis: {
        title: 'Heart Rate',
        titlefont: {color: '#ff7f0e'},
        tickfont: {color: '#ff7f0e'},
        range: [0, max_hr],
      },
      yaxis2: {
        title: velocity_name,
        titlefont: {color: '#ff7f0e'},
        tickfont: {color: '#ff7f0e'},
        tickvals: mps_ticks,
        ticktext: pace_ticks,
        anchor: 'x',
        overlaying: 'y',
        side: 'right',
        // autorange: this.state.activity.type === 'Run' ? 'reversed' : true,
        range: [pace_to_mps(11), pace_to_mps(2)],
      },
    };

    return (
      <Plot
        data={plot_data}
        layout={layout}
      />
    )
  }

  hr_zone_plot() {
    //{"heart_rate":{"custom_zones":false,"zones":[{"min":0,"max":125},{"min":125,"max":156},{"min":156,"max":171},{"min":171,"max":187},{"min":187,"max":-1}]},"power":null}

    const zones = this.state.zones.heart_rate.zones;
    let zone_spec = [];
    let labels = [];
    let bins = [];
    for (let i=0; i<zones.length; i++) {
      zone_spec.push(zones[i]);
      labels.push(`Zone ${i+1}`);
      bins.push(0);
    }

    this.state.streams.heartrate.data.map((hr) => {
      for (let i=0; i<zone_spec.length; i++) {
        if (zone_spec[i].max > hr || zone_spec[i].max === -1) {
          bins[i] += 1;
          break;
        }
      }
      return null;
    });

    var data = [{
      values: bins.map(u => u/this.state.streams.heartrate.data.length),
      labels: labels,
      type: 'pie',
      sort: false,
      direction: 'clockwise',
    }];

    var layout = {
      height: 400,
      width: 500,
      title: 'Heart-rate Zones',
    };

    return (
      <Plot data={data} layout={layout} />
    )
  }

  render() {
    if (this.state.authorized) {
      return (
        <Container fluid>
          <div id='map' style={{height: '40vh'}}>.</div>
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

export default ActivityDetail;
