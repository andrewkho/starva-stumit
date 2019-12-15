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
