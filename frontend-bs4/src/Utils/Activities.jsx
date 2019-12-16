import axios from "axios";

export function dateToEpochSeconds(day) {
  return Math.round(day.getTime() / 1000);
}

export async function get_activities(start, end) {
  const start_seconds = dateToEpochSeconds(start);
  const end_seconds = dateToEpochSeconds(end);

  console.log("start end " + start_seconds + " " + end_seconds);

  return await axios.post("/api/v1/get_activities", {
    start: start_seconds,
    end: end_seconds,
  }).then((response) => {
    return response.data;
  });
}

export function convertToPace(mps, metric) {
  // 1000m / km * 1 min / 60 s / m / s = min / km
  const min_per_km = 1000 / 60 / mps;
  let pace;
  if (metric) {
    pace = min_per_km;
  } else {
    pace = min_per_km * 1.6;
  }
  return pace;
}

export function convertToSpeed(mps, metric){
  // 1 km / 1000 m * 3600 s / 1 h * m / s = km / h
  const kph = 3600/1000 * mps;
  if (metric) {
    return kph;
  } else {
    return kph / 1.6;
  }
}

