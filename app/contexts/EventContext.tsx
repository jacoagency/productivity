'use client';

import React, { createContext, useContext, useState } from 'react';

interface EventContextType {
  refreshEvents: () => void;
  setRefreshEvents: (callback: () => void) => void;
}

const EventContext = createContext<EventContextType>({
  refreshEvents: () => {},
  setRefreshEvents: () => {},
});

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [refreshEvents, setRefreshEvents] = useState(() => () => {});

  return (
    <EventContext.Provider value={{ refreshEvents, setRefreshEvents }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
}; 