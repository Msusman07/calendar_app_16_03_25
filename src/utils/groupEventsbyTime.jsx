import moment from "moment";

export const groupEventsByTime = (events) => {
  return events.reduce((acc, event) => {
    const eventTime = moment(event.start).format("YYYY-MM-DD HH:mm");
    if (!acc[eventTime]) acc[eventTime] = [];
    acc[eventTime].push(event);
    return acc;
  }, {});
};
