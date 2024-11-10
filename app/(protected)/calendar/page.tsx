'use client';

import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect, useMemo } from 'react';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Event {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  desc?: string;
  isTaskEvent?: boolean;
}

const ColoredDateCellWrapper = ({ children, value }: any) => {
  const isToday = value.toDateString() === new Date().toDateString();
  return React.cloneElement(children, {
    style: {
      ...children.style,
      backgroundColor: isToday ? 'rgba(147, 51, 234, 0.05)' : '',
    },
  });
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState<Event>({
    _id: '',
    title: "",
    start: new Date(),
    end: addMinutes(new Date(), 60),
    desc: ""
  });

  // Load events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          const parsedEvents = data.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }));
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
    const startDate = new Date(start);
    let endDate;
    
    if (end) {
      endDate = new Date(end);
    } else {
      endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);
    }

    setNewEvent({
      _id: Date.now().toString(),
      title: "",
      start: startDate,
      end: endDate,
      desc: ""
    });
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setNewEvent(event);
    setShowModal(true);
  };

  const deleteEvent = async () => {
    if (selectedEvent) {
      try {
        // Eliminar el evento
        const response = await fetch(`/api/events/${selectedEvent._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Actualizar el estado local de eventos
          setEvents(events.filter(event => event._id !== selectedEvent._id));

          // Si es un evento de tarea, eliminar también la tarea
          const tasksResponse = await fetch('/api/tasks');
          if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            const relatedTask = tasks.find((task: any) => 
              task.title === selectedEvent.title && 
              new Date(task.dueDate).getTime() === new Date(selectedEvent.start).getTime()
            );

            if (relatedTask) {
              // Eliminar la tarea relacionada
              await fetch(`/api/tasks/${relatedTask._id}`, {
                method: 'DELETE',
              });
            }
          }

          setShowModal(false);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        // Update existing event
        const response = await fetch(`/api/events/${selectedEvent._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newEvent,
            start: new Date(newEvent.start),
            end: new Date(newEvent.end)
          }),
        });

        if (response.ok) {
          setEvents(events.map(event => 
            event._id === selectedEvent._id ? {
              ...newEvent,
              start: new Date(newEvent.start),
              end: new Date(newEvent.end)
            } : event
          ));
        }
      } else {
        // Create new event
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newEvent,
            start: new Date(newEvent.start),
            end: new Date(newEvent.end),
            color: '#7C3AED', // Color púrpura por defecto
            isTaskEvent: true
          }),
        });

        if (response.ok) {
          const event = await response.json();
          setEvents([...events, {
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }]);

          // Crear la tarea correspondiente
          await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: newEvent.title,
              dueDate: newEvent.start,
              completed: false,
              folder: 'day',
              folderDate: format(new Date(newEvent.start), 'yyyy-MM-dd')
            }),
          });
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate: new Date(),
      views: {
        month: true,
        week: true,
        day: true,
        agenda: true,
      },
    }),
    []
  );

  return (
    <main className="container mx-auto p-6 sm:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Calendar
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {format(date, 'MMMM yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDate(new Date())}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                       rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setNewEvent({
                  _id: Date.now().toString(),
                  title: "",
                  start: new Date(),
                  end: addMinutes(new Date(), 60),
                  desc: ""
                });
                setShowModal(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Add Event
            </button>
          </div>
        </div>

        <div className="h-[700px] mt-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelect}
            onSelectEvent={handleEventSelect}
            view={view}
            onView={setView as any}
            date={date}
            onNavigate={setDate}
            defaultDate={defaultDate}
            views={views}
            className="h-full"
            components={{
              dateCellWrapper: ColoredDateCellWrapper,
              timeSlotWrapper: ColoredDateCellWrapper,
            }}
            style={{ 
              backgroundColor: 'transparent',
              height: '100%' 
            }}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {selectedEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEventSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.desc}
                  onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add event description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newEvent.allDay}
                  onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded
                           focus:ring-purple-500 dark:focus:ring-purple-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">All day event</span>
              </label>

              <div className="flex justify-end items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={deleteEvent}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white 
                             rounded-lg transition-colors focus:outline-none focus:ring-2 
                             focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Delete Event
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                           dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white 
                           rounded-lg transition-colors focus:outline-none focus:ring-2 
                           focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {selectedEvent ? 'Update' : 'Add'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
} 