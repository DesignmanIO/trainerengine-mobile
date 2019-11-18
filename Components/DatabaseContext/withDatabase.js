import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

import DatabaseContext from './DatabaseContext';

const withDatabase = WrappedComponent =>
  hoistStatics(
    <DatabaseContext.Consumer>
      {database => <WrappedComponent database={database} />}
    </DatabaseContext.Consumer>,
  );

export default withDatabase;
