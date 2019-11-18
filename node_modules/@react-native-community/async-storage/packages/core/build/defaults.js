"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simpleErrorHandler = simpleErrorHandler;
exports.simpleLogger = simpleLogger;
exports.noop = noop;
exports.factoryOptions = void 0;
const factoryOptions = {
  logger: __DEV__,
  errorHandler: __DEV__
};
exports.factoryOptions = factoryOptions;

function simpleErrorHandler(e) {
  let errorMessage = e instanceof Error ? e.message : e;
  console.error(errorMessage);
}

function simpleLogger(logInfo) {
  const log = message => {
    console.log(`[AsyncStorage] ${message}`);
  };

  const {
    action,
    key,
    value
  } = logInfo;

  switch (action) {
    case 'read-single':
      {
        log(`Reading a value for a key: ${key}`);
        break;
      }

    case 'save-single':
      {
        log(`Saving a value: ${value} for a key: ${key}`);
        break;
      }

    case 'delete-single':
      {
        log(`Removing value at a key: ${key}`);
        break;
      }

    case 'read-many':
      {
        log(`Reading values for keys: ${key}`);
        break;
      }

    case 'save-many':
      {
        log(`Saving values ${value} for keys: ${key}`);
        break;
      }

    case 'delete-many':
      {
        log(`Removing multiple values for keys: ${key}`);
        break;
      }

    case 'drop':
      {
        log('Dropping whole database');
        break;
      }

    case 'keys':
      {
        log('Retrieving keys');
        break;
      }

    default:
      {
        log(`Unknown action: ${action}`);
      }
  }
}

function noop() {// noop
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWZhdWx0cy50cyJdLCJuYW1lcyI6WyJmYWN0b3J5T3B0aW9ucyIsImxvZ2dlciIsIl9fREVWX18iLCJlcnJvckhhbmRsZXIiLCJzaW1wbGVFcnJvckhhbmRsZXIiLCJlIiwiZXJyb3JNZXNzYWdlIiwiRXJyb3IiLCJtZXNzYWdlIiwiY29uc29sZSIsImVycm9yIiwic2ltcGxlTG9nZ2VyIiwibG9nSW5mbyIsImxvZyIsImFjdGlvbiIsImtleSIsInZhbHVlIiwibm9vcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBRU8sTUFBTUEsY0FBOEIsR0FBRztBQUM1Q0MsRUFBQUEsTUFBTSxFQUFFQyxPQURvQztBQUU1Q0MsRUFBQUEsWUFBWSxFQUFFRDtBQUY4QixDQUF2Qzs7O0FBS0EsU0FBU0Usa0JBQVQsQ0FBNEJDLENBQTVCLEVBQStDO0FBQ3BELE1BQUlDLFlBQVksR0FBR0QsQ0FBQyxZQUFZRSxLQUFiLEdBQXFCRixDQUFDLENBQUNHLE9BQXZCLEdBQWlDSCxDQUFwRDtBQUNBSSxFQUFBQSxPQUFPLENBQUNDLEtBQVIsQ0FBY0osWUFBZDtBQUNEOztBQUVNLFNBQVNLLFlBQVQsQ0FBc0JDLE9BQXRCLEVBQTZDO0FBQ2xELFFBQU1DLEdBQUcsR0FBSUwsT0FBRCxJQUFxQjtBQUMvQkMsSUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQWEsa0JBQWlCTCxPQUFRLEVBQXRDO0FBQ0QsR0FGRDs7QUFJQSxRQUFNO0FBQUNNLElBQUFBLE1BQUQ7QUFBU0MsSUFBQUEsR0FBVDtBQUFjQyxJQUFBQTtBQUFkLE1BQXVCSixPQUE3Qjs7QUFFQSxVQUFRRSxNQUFSO0FBQ0UsU0FBSyxhQUFMO0FBQW9CO0FBQ2xCRCxRQUFBQSxHQUFHLENBQUUsOEJBQTZCRSxHQUFJLEVBQW5DLENBQUg7QUFDQTtBQUNEOztBQUNELFNBQUssYUFBTDtBQUFvQjtBQUNsQkYsUUFBQUEsR0FBRyxDQUFFLG1CQUFrQkcsS0FBTSxlQUFjRCxHQUFJLEVBQTVDLENBQUg7QUFDQTtBQUNEOztBQUNELFNBQUssZUFBTDtBQUFzQjtBQUNwQkYsUUFBQUEsR0FBRyxDQUFFLDRCQUEyQkUsR0FBSSxFQUFqQyxDQUFIO0FBQ0E7QUFDRDs7QUFDRCxTQUFLLFdBQUw7QUFBa0I7QUFDaEJGLFFBQUFBLEdBQUcsQ0FBRSw0QkFBMkJFLEdBQUksRUFBakMsQ0FBSDtBQUNBO0FBQ0Q7O0FBQ0QsU0FBSyxXQUFMO0FBQWtCO0FBQ2hCRixRQUFBQSxHQUFHLENBQUUsaUJBQWdCRyxLQUFNLGNBQWFELEdBQUksRUFBekMsQ0FBSDtBQUNBO0FBQ0Q7O0FBQ0QsU0FBSyxhQUFMO0FBQW9CO0FBQ2xCRixRQUFBQSxHQUFHLENBQUUsc0NBQXFDRSxHQUFJLEVBQTNDLENBQUg7QUFDQTtBQUNEOztBQUNELFNBQUssTUFBTDtBQUFhO0FBQ1hGLFFBQUFBLEdBQUcsQ0FBQyx5QkFBRCxDQUFIO0FBQ0E7QUFDRDs7QUFDRCxTQUFLLE1BQUw7QUFBYTtBQUNYQSxRQUFBQSxHQUFHLENBQUMsaUJBQUQsQ0FBSDtBQUNBO0FBQ0Q7O0FBQ0Q7QUFBUztBQUNQQSxRQUFBQSxHQUFHLENBQUUsbUJBQWtCQyxNQUFPLEVBQTNCLENBQUg7QUFDRDtBQW5DSDtBQXFDRDs7QUFFTSxTQUFTRyxJQUFULEdBQWdCLENBQ3JCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0ZhY3RvcnlPcHRpb25zLCBMb2dnZXJBY3Rpb259IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGNvbnN0IGZhY3RvcnlPcHRpb25zOiBGYWN0b3J5T3B0aW9ucyA9IHtcbiAgbG9nZ2VyOiBfX0RFVl9fLFxuICBlcnJvckhhbmRsZXI6IF9fREVWX18sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc2ltcGxlRXJyb3JIYW5kbGVyKGU6IEVycm9yIHwgc3RyaW5nKSB7XG4gIGxldCBlcnJvck1lc3NhZ2UgPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBlO1xuICBjb25zb2xlLmVycm9yKGVycm9yTWVzc2FnZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaW1wbGVMb2dnZXIobG9nSW5mbzogTG9nZ2VyQWN0aW9uKSB7XG4gIGNvbnN0IGxvZyA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgW0FzeW5jU3RvcmFnZV0gJHttZXNzYWdlfWApO1xuICB9O1xuXG4gIGNvbnN0IHthY3Rpb24sIGtleSwgdmFsdWV9ID0gbG9nSW5mbztcblxuICBzd2l0Y2ggKGFjdGlvbikge1xuICAgIGNhc2UgJ3JlYWQtc2luZ2xlJzoge1xuICAgICAgbG9nKGBSZWFkaW5nIGEgdmFsdWUgZm9yIGEga2V5OiAke2tleX1gKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICdzYXZlLXNpbmdsZSc6IHtcbiAgICAgIGxvZyhgU2F2aW5nIGEgdmFsdWU6ICR7dmFsdWV9IGZvciBhIGtleTogJHtrZXl9YCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnZGVsZXRlLXNpbmdsZSc6IHtcbiAgICAgIGxvZyhgUmVtb3ZpbmcgdmFsdWUgYXQgYSBrZXk6ICR7a2V5fWApO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ3JlYWQtbWFueSc6IHtcbiAgICAgIGxvZyhgUmVhZGluZyB2YWx1ZXMgZm9yIGtleXM6ICR7a2V5fWApO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ3NhdmUtbWFueSc6IHtcbiAgICAgIGxvZyhgU2F2aW5nIHZhbHVlcyAke3ZhbHVlfSBmb3Iga2V5czogJHtrZXl9YCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnZGVsZXRlLW1hbnknOiB7XG4gICAgICBsb2coYFJlbW92aW5nIG11bHRpcGxlIHZhbHVlcyBmb3Iga2V5czogJHtrZXl9YCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnZHJvcCc6IHtcbiAgICAgIGxvZygnRHJvcHBpbmcgd2hvbGUgZGF0YWJhc2UnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICdrZXlzJzoge1xuICAgICAgbG9nKCdSZXRyaWV2aW5nIGtleXMnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICBsb2coYFVua25vd24gYWN0aW9uOiAke2FjdGlvbn1gKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vb3AoKSB7XG4gIC8vIG5vb3Bcbn1cbiJdfQ==