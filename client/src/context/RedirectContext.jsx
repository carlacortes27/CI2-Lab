import { createContext, useContext, useState } from 'react';

const RedirectContext = createContext();

export function RedirectProvider({ children }) {
  const [intendedPage, setIntendedPage] = useState(null);

  const saveIntendedPage = (page) => {
    setIntendedPage(page);
  };

  const getAndClearIntendedPage = () => {
    const page = intendedPage;
    setIntendedPage(null);
    return page;
  };

  return (
    <RedirectContext.Provider value={{ intendedPage, saveIntendedPage, getAndClearIntendedPage }}>
      {children}
    </RedirectContext.Provider>
  );
}

export function useRedirect() {
  const context = useContext(RedirectContext);
  if (!context) {
    throw new Error('useRedirect debe usarse dentro de RedirectProvider');
  }
  return context;
}
