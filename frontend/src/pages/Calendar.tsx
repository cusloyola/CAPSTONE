import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta.jsx";
import api from '../api.jsx';

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false); // State for delete confirmation modal
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  // Fetch events from backend on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");  // Make sure the backend is returning events
        const formattedEvents = response.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_date).toISOString(),
          end: new Date(event.end_date).toISOString(),
          extendedProps: {
            calendar: event.event_level,
          },
        }));
        setEvents(formattedEvents);  // Set formatted events to state
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();  // Fetch events when component mounts (or page reloads)
  }, []);


  // Helper function to update the event in FullCalendar and React state
  const updateEventInCalendar = (calendarApi: any, updatedEvent: CalendarEvent) => {
    const calendarEvent = calendarApi.getEventById(String(updatedEvent.id));
    if (calendarEvent) {
      calendarEvent.setProp('title', updatedEvent.title);
      calendarEvent.setStart(updatedEvent.start);
      calendarEvent.setEnd(updatedEvent.end);
      calendarEvent.setExtendedProp('calendar', updatedEvent.extendedProps.calendar);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;

    // Convert the event start and end dates to local time
    const startDate = new Date(event.start?.toString() || "");
    const endDate = new Date(event.end?.toString() || "");

    // Format the dates to MM/DD/YY format for input[type="date"]
    const localStartDate = startDate.toLocaleDateString('en-US');  // MM/DD/YY format
    const localEndDate = endDate.toLocaleDateString('en-US');  // MM/DD/YY format

    // Set the selected event data to be displayed in the modal
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);

    // Set the local start and end date for the event in the modal
    setEventStartDate(localStartDate);
    setEventEndDate(localEndDate);

    // Set the event level
    setEventLevel(event.extendedProps.calendar);

    openModal();
  };




  const handleAddOrUpdateEvent = async () => {
    // Call validation function before proceeding
    if (!validateEventFields()) return;

    // Clear previous error messages before proceeding
    setErrorMessage(null);

    console.log({
      eventTitle,
      eventStartDate,
      eventEndDate,
      eventLevel,
    });

    // Check if we are updating an existing event
    if (selectedEvent && selectedEvent.id) {
      // Update existing event
      try {
        // Send the update to the backend
        await api.put(`/events/${selectedEvent.id}`, {
          title: eventTitle,
          start_date: eventStartDate,
          end_date: eventEndDate,
          event_level: eventLevel,
        });

        // Update FullCalendar's internal event
        const calendarApi = calendarRef.current?.getApi();
        const calendarEvent = calendarApi?.getEventById(String(selectedEvent.id));

        if (calendarEvent) {
          // Update the event properties in FullCalendar
          calendarEvent.setProp('title', eventTitle);
          calendarEvent.setStart(eventStartDate);
          calendarEvent.setEnd(eventEndDate);
          calendarEvent.setExtendedProp('calendar', eventLevel);
        }

        // Update the React state to reflect the changes in the event
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id
              ? { ...event, title: eventTitle, start: eventStartDate, end: eventEndDate, extendedProps: { calendar: eventLevel } }
              : event
          )
        );

        // Ensure FullCalendar re-renders with the updated event
        if (calendarApi) {
          calendarApi.refetchEvents(); // Trigger FullCalendar to re-render and reflect the updated event
        }

      } catch (error) {
        console.error("Error updating event:", error);
        setErrorMessage("Failed to update event. Please try again later.");
      }
    } else {
      // Add new event
      try {
        const response = await api.post("/events", {
          title: eventTitle,
          start_date: eventStartDate,
          end_date: eventEndDate,
          event_level: eventLevel,
        });

        const addedEvent = {
          id: response.data.id,
          title: eventTitle,
          start: eventStartDate,
          end: eventEndDate,
          extendedProps: { calendar: eventLevel },
        };

        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
          // Add the new event to FullCalendar
          calendarApi.addEvent(addedEvent);
        }

        // Update React's state with the new event
        setEvents((prevEvents) => [...prevEvents, addedEvent]);

      } catch (error) {
        console.error("Error adding event:", error);
        setErrorMessage("Failed to add event. Please try again later.");
      }
    }

    closeModal();
    resetModalFields();
  };

  // General event validation function
  const validateEventFields = () => {
    if (!eventTitle || !eventStartDate || !eventEndDate) {
      setErrorMessage("Please fill in all fields: title, start date, and end date.");
      return false;
    }
    return true;
  };


  // Function to handle deletion and show confirmation modal
  const handleDeleteEvent = async () => {
    if (showDeleteConfirmModal) {
      if (selectedEvent) {
        try {
          await api.delete(`/events/${selectedEvent.id}`);
          console.log(`Event ${selectedEvent.id} deleted successfully`);

          const calendarApi = calendarRef.current?.getApi();
          if (calendarApi) {
            calendarApi.getEvents().forEach((event) => {
              if (event.id === selectedEvent.id) {
                event.remove(); // Remove the event directly from FullCalendar
              }
            });
          }

          setEvents((prevEvents) =>
            prevEvents.filter((event) => event.id !== selectedEvent.id)
          );
        } catch (error) {
          console.error("Error deleting event:", error);
          setErrorMessage("Failed to delete event. Please try again later.");
        }

        closeModal();
      }
      setShowDeleteConfirmModal(false); // Close the confirmation modal
    } else {
      // Show delete confirmation modal
      setShowDeleteConfirmModal(true);
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
    setErrorMessage(null); // Reset error message
  };

  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Add Event +",
                click: openModal,
              },
            }}
          />
        </div>

        {/* Main Modal for Add/Edit Event */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Event" : "Add Event"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your next big moment: schedule or edit an event to stay on track
              </p>
            </div>

            {errorMessage && (
              <div className="mt-4 text-red-500">
                <strong>Error: </strong>{errorMessage}
              </div>
            )}

            <div className="mt-8">
              {/* Event Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Event Color */}
              <div className="mt-6">
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Color
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div
                        className={`form-check form-check-${value} form-check-inline`}
                      >
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={eventLevel === key}
                              onChange={() => setEventLevel(key)}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span className="w-2 h-2 bg-white rounded-full dark:bg-transparent"></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Start Date */}
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter Start Date
                </label>
                <div className="relative">
                  <input
                    id="event-start-date"
                    type="text"
                    value={eventStartDate} // Use the start date value
                    onChange={(e) => setEventStartDate(e.target.value)}
                    placeholder="MM/DD/YY"
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>

              {/* Event End Date */}
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter End Date
                </label>
                <div className="relative">
                  <input
                    id="event-end-date"
                    type="text"
                    value={eventEndDate} // Use the end date value
                    onChange={(e) => setEventEndDate(e.target.value)}
                    placeholder="MM/DD/YY"
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Update Changes" : "Add Event"}
              </button>
              {selectedEvent && (
                <button
                  onClick={handleDeleteEvent}
                  type="button"
                  className="btn btn-danger flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                >
                  Delete Event
                </button>
              )}
            </div>
          </div>
        </Modal>



        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          className="max-w-[500px] p-6 lg:p-10"
        >
          <div className="text-center">
            <h5 className="mb-4 font-semibold text-lg text-gray-800 dark:text-gray-400">
              Are you sure you want to delete this event?
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                className="btn btn-danger"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
