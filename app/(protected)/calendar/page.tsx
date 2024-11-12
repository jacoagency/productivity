'use client';

import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, IMPORTANCE_LEVELS } from '@/types/task';
import { NewCategoryModal } from '@/app/components/NewCategoryModal';
import { useCategories } from '@/hooks/useCategories';

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
  category?: string;
  importance?: string;
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
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewImportanceModal, setShowNewImportanceModal] = useState(false);
  const { categories, importanceLevels } = useCategories();

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

          // Crear la tarea correspondiente con la misma categoría e importancia
          await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: newEvent.title,
              dueDate: newEvent.start,
              completed: false,
              category: newEvent.category,
              importance: newEvent.importance,
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

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = '#7C3AED'; // default purple

    if (event.importance) {
      const importance = IMPORTANCE_LEVELS.find(i => i.id === event.importance);
      if (importance) {
        backgroundColor = importance.color;
      }
    } else if (event.category) {
      const category = CATEGORIES.find(c => c.id === event.category);
      if (category) {
        backgroundColor = category.color;
      }
    }

    return {
      style: {
        backgroundColor,
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        padding: '2px 5px',
        borderRadius: '4px'
      }
    };
  };

  const handleNewCategory = async (newCategory: { label: string; color: string }) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const category = await response.json();
        // Actualizar la lista de categorías
        // Aquí necesitarías manejar el estado de las categorías
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleNewImportance = async (newImportance: { label: string; color: string }) => {
    try {
      const response = await fetch('/api/importance-levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newImportance),
      });

      if (response.ok) {
        const importance = await response.json();
        // Actualizar la lista de niveles de importancia
        // Aquí necesitarías manejar el estado de los niveles
      }
    } catch (error) {
      console.error('Error creating importance level:', error);
    }
  };

  return (
    <main className="container mx-auto p-6 sm:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="h-[700px]">
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
            messages={{
              today: 'Today',
              previous: 'Back',
              next: 'Next',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              agenda: 'Agenda',
            }}
            formats={{
              monthHeaderFormat: 'MMMM yyyy',
              dayHeaderFormat: 'EEEE, MMMM d',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`,
            }}
            step={30}
            timeslots={1}
            min={new Date(0, 0, 0, 6, 0, 0)}
            max={new Date(0, 0, 0, 22, 0, 0)}
            dayLayoutAlgorithm={'no-overlap'}
            eventStyleGetter={eventStyleGetter}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div className="flex gap-2">
                  <select
                    value={newEvent.category || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    New
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Importance Level
                </label>
                <div className="flex gap-4">
                  {importanceLevels.map(level => (
                    <label key={level.id} className="flex items-center">
                      <input
                        type="radio"
                        name="importance"
                        value={level.id}
                        checked={newEvent.importance === level.id}
                        onChange={(e) => setNewEvent({ ...newEvent, importance: e.target.value })}
                        className="mr-2 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: level.color }} />
                        <span>{level.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

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

      {showNewCategoryModal && (
        <NewCategoryModal
          type="category"
          onClose={() => setShowNewCategoryModal(false)}
          onSave={(id) => {
            setNewEvent({ ...newEvent, category: id });
          }}
        />
      )}

      {showNewImportanceModal && (
        <NewCategoryModal
          type="importance"
          onClose={() => setShowNewImportanceModal(false)}
          onSave={handleNewImportance}
        />
      )}
    </main>
  );
}