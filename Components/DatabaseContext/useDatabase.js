import { useContext } from 'react';

import DatabaseContext from './DatabaseContext';

const useDatabase = () => useContext(DatabaseContext);

export default useDatabase;
