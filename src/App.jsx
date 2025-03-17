import { useEffect, useRef, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";
import GoogleMeetImg from "./components/GoogleMeetImg";
import { groupEventsByTime } from "./utils/groupEventsbyTime";
import { eventStyleGetter } from "./styles/eventStyleGetter";

const localizer = momentLocalizer(moment);

const App = () => {
  const [data, setData] = useState([]);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/calendarfromtoenddate.json");
        if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const events = data.map((event) => ({
    id: event.id,
    title: event.job_id.jobRequest_Title,
    start: new Date(event.start),
    end: new Date(event.end),
    interviewer: event.user_det.handled_by.firstName,
    candidate: event.user_det.candidate.candidate_firstName,
    link: event.link,
    summary: event.summary,
    startTime: moment(event.start).format("HH: mm"),
    endTime: moment(event.end).format("HH: mm A"),
  }));

  const uniqueEvents = [];
  const seenTimes = new Set();

  events.forEach((event) => {
    const eventTime = moment(event.start).format("YYYY-MM-DD HH:mm");
    if (!seenTimes.has(eventTime)) {
      uniqueEvents.push(event);
      seenTimes.add(eventTime);
    }
  });

  const groupedEvents = groupEventsByTime(events);

  const HandleListItemClick = (event) => {
    setSelectedItem(event);
    setSelectedEvent([]);
  };

  const EventComponent = ({ event }) => {
    const eventTime = moment(event.start).format("YYYY-MM-DD HH:mm");
    const eventGroup = groupedEvents[eventTime] || [];
    const eventRef = useRef(null);

    const handleEventClick = () => {
      const eventTime = moment(event.start).format("YYYY-MM-DD HH:mm");

      if (eventRef.current) {
        const rect = eventRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.top - 50 + window.scrollY, // Align with event vertically
          left: rect.right + 30 + window.scrollX, // Align with event
        });
      }

      if (groupedEvents[eventTime]) {
        setSelectedEvent(groupedEvents[eventTime]);
      } else {
        setSelectedEvent([]);
      }
    };

    return (
      <div ref={eventRef} onClick={(e) => handleEventClick(e, eventGroup)}>
        {eventGroup.length > 1 && (
          <div className="event-container">
            <div className="count">{eventGroup.length}</div>
            <div className="event-details">
              <div>{event.title}</div>
              <div>Interviewer: {event.interviewer}</div>
              <div>
                Time:{event.startTime} - {event.endTime}
              </div>
            </div>
          </div>
        )}
        {eventGroup.length === 1 && (
          <div>
            <div>{event.title}</div>
            <div>Interviewer: {event.interviewer}</div>
            <div>
              Time: {event.startTime} - {event.endTime}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleNavigate = (meetLink) => {
    if (meetLink) {
      window.open(meetLink);
    } else {
      alert("Google Meet link not available.");
    }
  };
  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedEvent(null);
  };
  return (
    <div style={{ height: "100vh", padding: "20px" }}>
      <Calendar
        localizer={localizer}
        events={uniqueEvents}
        startAccessor="start"
        endAccessor="end"
        views={{ month: true, week: true, day: true }}
        view={currentView}
        date={currentDate}
        onView={(view) => handleViewChange(view)}
        onNavigate={(date) => setCurrentDate(date)}
        style={{ height: "90vh" }}
        components={{ event: EventComponent }}
        eventPropGetter={eventStyleGetter}
        dayLayoutAlgorithm="no-overlap"
      />

      {selectedEvent?.length > 1 && (
        <div
          className="event-List"
          onMouseLeave={() => setSelectedEvent([])}
          style={{
            position: "absolute",
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            background: "white",
            borderRadius: "8px",
            border: "1px solid #ddd",
            padding: "12px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            minWidth: "260px",
            zIndex: 1000,
            listStyle: "none",
            fontSize: "14px",
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          <div className="List-header">
            <h3>Meeting</h3>
            <div
              className="List-header-close-btn"
              onClick={() => setSelectedEvent([])}
            >
              &times;
            </div>
          </div>
          <ul className="Event-list">
            {selectedEvent.map((ev, idx) => (
              <li
                className="event-item"
                key={idx}
                onClick={() => HandleListItemClick(ev)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <div>{ev.title}</div>
                <div className="list-item_line_2">
                  <div>{ev.summary}</div>
                  <div>Interviewer:{ev.interviewer}</div>
                </div>
                <div className="list-item_line_2">
                  <div>Date:{ev.interviewer}</div>
                  <div>{ev.summary}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedEvent?.length === 1 && (
        <div className="overlay">
          <div className="popup">
            <button
              className="close-btn"
              onClick={() => setSelectedEvent(null)}
            >
              &times;
            </button>
            <div className="popup-content">
              <div className="left-half">
                <p>Interview With: {selectedEvent[0].interviewer}</p>
                <p>Postion : {selectedEvent[0].title}</p>
                <p>Created By : - </p>
                <p>
                  Interview Date :
                  {moment(selectedEvent[0].start).format("DD MMM YYYY")}
                </p>
                <p>Interview Via : Google Meet</p>
              </div>
              <div className="right-half">
                <GoogleMeetImg />
                <button
                  className="joinbutton"
                  onClick={() => handleNavigate(selectedEvent[0]?.link)}
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedItem && (
        <div className="overlay">
          <div className="popup">
            <button className="close-btn" onClick={() => setSelectedItem(null)}>
              &times;
            </button>
            <div className="popup-content">
              <div className="left-half">
                <p>Interview With: {selectedItem.interviewer}</p>
                <p>Postion : {selectedItem.title}</p>
                <p>Created By : -</p>
                <p>
                  Interview Date :{" "}
                  {moment(selectedItem.start).format("DD MMM YYYY")}
                </p>
                <p>Interview Via : Google Meet</p>
              </div>
              <div className="right-half">
                <GoogleMeetImg />
                <button
                  className="joinbutton"
                  onClick={() => handleNavigate(selectedItem?.link)}
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
