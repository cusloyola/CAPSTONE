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
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


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

  const addOneDay = (dateStr: string): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);  // Do not add an extra day, use as is
    return date.toISOString();
  };



  // Fetch events from backend on mount
  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");

      const formattedEvents = response.data.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_date).toISOString(),
        end: addOneDay(event.end_date),
        extendedProps: { calendar: event.event_level },
      }));
      console.log("Formatted events:", formattedEvents);

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchEvents();
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
    setSelectedEvent(null); // Ensure modal knows this is "Add Event"
    resetModalFields();

    // Format start and end dates as MM/DD/YYYY
    const formattedStartDate = new Date(selectInfo.startStr).toLocaleDateString('en-US');
    const formattedEndDate = new Date(selectInfo.endStr || selectInfo.startStr).toLocaleDateString('en-US');

    setEventStartDate(formattedStartDate);
    setEventEndDate(formattedEndDate);

    openModal();
  };


  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    console.log("Event clicked:", event);

    // Convert the event start and end dates to local time (ensure correct handling)
    const startDate = new Date(event.start?.toString() || "");
    let endDate = new Date(event.end?.toString() || "");

    // Check if endDate is exactly midnight (start of the next day)
    if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {
      // Adjust end date to avoid showing an extra day
      endDate = new Date(endDate.getTime() - 1);  // Subtract 1 millisecond to correct this
    }

    console.log("Local start date:", startDate);
    console.log("Local end date:", endDate);

    // Format the dates to MM/DD/YY format for input[type="date"]
    const localStartDate = startDate.toLocaleDateString('en-US');  // MM/DD/YY format
    const localEndDate = endDate.toLocaleDateString('en-US');  // MM/DD/YY format

    console.log("Formatted local start date:", localStartDate);
    console.log("Formatted local end date:", localEndDate);

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



  const formatToISODate = (dateStr: string): string => {
    const [month, day, year] = dateStr.split('/');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return isoDate;
  };

  const handleAddEvent = async () => {
    if (!validateEventFields()) return;
    setErrorMessage(null);

    try {

      // Format start and end dates
      const startISO = formatToISODate(eventStartDate);
      const endISO = formatToISODate(eventEndDate);

      // Send the event to the API
      const response = await api.post("/events", {
        title: eventTitle,
        start_date: startISO,
        end_date: endISO,
        event_level: eventLevel,
      });

      // Format the added event to match FullCalendar's expected date format
      const addedEvent = {
        id: response.data.id,
        title: eventTitle,
        start: startISO,
        end: endISO,  // Correct end date to match FullCalendar's expectations
        extendedProps: { calendar: eventLevel },
      };

      // Add the event to FullCalendar
      calendarRef.current?.getApi().addEvent(addedEvent);

      // Update the state with the new event
      setEvents((prev) => [...prev, addedEvent]);

      toast.success("Event added successfully");

      // Refetch events from the database to ensure correct data (especially end date)
      await fetchEvents();  // Fetch all events to ensure that the calendar is in sync with the database


    } catch (error) {
      setErrorMessage("Failed to add event. Please try again later.");
      toast.error("Add failed. Try again.");
    }

    closeModal();
    resetModalFields();
  };


  const handleUpdateEvent = async () => {
    if (!validateEventFields()) return;
    if (!selectedEvent?.id) return;
    setErrorMessage(null);

    try {
      const startISO = formatToISODate(eventStartDate);
      const endISO = formatToISODate(eventEndDate);

      await api.put(`/events/${selectedEvent.id}`, {
        title: eventTitle,
        start_date: startISO,
        end_date: endISO,
        event_level: eventLevel,
      });

      const updatedEvent = {
        ...selectedEvent,
        title: eventTitle,
        start: startISO,
        end: addOneDay(endISO),
        extendedProps: { calendar: eventLevel },
      };

      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) updateEventInCalendar(calendarApi, updatedEvent);

      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id ? updatedEvent : event
        )
      );

      toast.success("Event updated successfully");
    } catch (error) {
      setErrorMessage("Failed to update event. Please try again later.");
      toast.error("Update failed.");
    }

    closeModal();
    resetModalFields();
    fetchEvents();
  };

  const handleAddOrUpdateEvent = async () => {
    if (selectedEvent?.id) {
      await handleUpdateEvent();
    } else {
      await handleAddEvent();
    }
  };

  // General event validation function
  const validateEventFields = (): boolean => {
    if (!eventTitle || !eventStartDate || !eventEndDate) {
      setErrorMessage("Please fill in all fields: title, start date, and end date.");
      return false;
    }

    const isValidDate = (dateStr: string) => {
      const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!regex.test(dateStr)) return false;

      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    };

    if (!isValidDate(eventStartDate)) {
      setErrorMessage("Start date is invalid. Use MM/DD/YYYY format.");
      return false;
    }

    if (!isValidDate(eventEndDate)) {
      setErrorMessage("End date is invalid. Use MM/DD/YYYY format.");
      return false;
    }

    const start = new Date(eventStartDate);
    const end = new Date(eventEndDate);
    if (start > end) {
      setErrorMessage("Start date cannot be after end date.");
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
          toast.success("Event deleted successfully"); // ✅ Toast after successful delete

        } catch (error) {
          console.error("Error deleting event:", error);
          setErrorMessage("Failed to delete event. Please try again later.");
          toast.error(errorMessage);
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
    setErrorMessage(null);
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
                {errorMessage}
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
          className="max-w-md p-6 lg:p-8"
        >
          <div className="text-center space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
              </svg>
            </div>

            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Event?
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action is irreversible. Are you sure you want to proceed?
            </p>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Confirm Delete
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
