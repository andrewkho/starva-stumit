import axios from "axios";
import React, { Component } from "react";
import polyUtil from 'polyline-encoded';
import Container from "react-bootstrap/Container";
import qs from "query-string";
import Row from "react-bootstrap/Row";
import Plot from 'react-plotly.js';


class ActivityDetail extends Component {
  constructor(props) {
    super(props);
    const query_params = qs.parse(this.props.location.search);
    this.state = {
      activity_id: query_params.activity_id,
      activity: null,
      streams: null,
      loading: true,
      metric: query_params.metric,
    };
    this.convertToPace = this.convertToPace.bind(this);
  }

  async componentDidMount() {
    console.log(`activity_id: ${this.state.activity_id}`);
    // const zones = axios.post("http://localhost/api/v1/get_activity_zones", {
    //const zones = axios.post("http://localhost/api/v1/get_activity_details", {
    axios.post("http://localhost/api/v1/get_activity_details", {
      "activity_id": this.state.activity_id,
    }).then(resp => {
      this.setState({
        activity: resp.data,
        loading: false,
      });

      this.load_map()
    }).catch(err => {
      console.error(err)
    });
    axios.post("http://localhost/api/v1/get_activity_streams", {
      "activity_id": this.state.activity_id,
      "streamtypes": [
        'velocity_smooth',
        'grade_smooth',
        'distance',
        'heartrate',
        'time',
      ],
    }).then(resp => {
      console.log(JSON.stringify(resp.data));
      this.setState({
        streams: resp.data,
      })
    }).catch(err => {
      console.error(err)
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

    console.log(this.state.activity.type);

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
    const latlngs = polyUtil.decode(this.state.activity.map.summary_polyline);

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
        center: [37.769167, -122.478468],
        basePath: '/tomtom-sdk',
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
    const plot_data = [
      {
        label: 'heartrate',
        type: 'line',
        x: x,
        y: this.state.streams.heartrate.data,
        marker: {color: 'red'},
      },
      {
        label: 'velocity',
        type: 'line',
        x: x,
        y: this.state.streams.velocity_smooth.data.map(this.convertToPace),
        marker: {color: 'blue'},
      },
    ];

    return (
      <Plot
        data={plot_data}
        layout={{width: "60vw", height: "40vh", title: 'Stream data'}}
      />
    )
  }

  render() {
    return(
      <Container fluid>
        <div id='map' style={{height: '40vh', width: '100vw'}}>.</div>
        {!this.state.activity ?
           <h1>Loading...</h1> :
           <div>
             <Row>Distance {this.getDistance()}</Row>
             <Row>Moving Time {this.getMovingTime()}</Row>
             <Row>Avg. Pace {this.getAveragePace()}</Row>
             {this.state.activity.has_heartrate ?
               <Row>Avg. HR {this.state.activity.average_heartrate}</Row> :
               ''}
           </div>
        }
        {this.state.streams && this.state.activity ? this.hr_plot() : ''}
      </Container>
    )
  }

}

export default ActivityDetail;
