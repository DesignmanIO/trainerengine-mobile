import React from 'react';

import DatabaseContext from './DatabaseContext';

const DatabaseProvider = ({ children, database }) => (
  <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>
);

export default DatabaseProvider;
