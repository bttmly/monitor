var monitor = (function(){

  var isArray = Array.isArray;

  var slice = Function.prototype.call.bind( [].slice );

  // helper functions
  function isFunction( obj ) {
    return obj && Object.prototype.toString.call( obj ) === "[object Function]";
  }

  function mixin( target, source ){
    for ( var key in source ) {
      if ( source.hasOwnProperty( key ) ) {
        target[key] = source[key];
      }
    }
    return target;
  }

  function pluck( collection, key ) {
    return collection.map(function( obj ){
      return obj[key];
    });
  }

  function contains( arr, value ) {
    if ( isArray( value ) ) {
      return value.every( function( v ) {
        return contains( arr, v );
      });
    } else {
      return arr.indexOf( value ) > -1;
    }
  }

  function flatten( arr, out ) {
    out = out || [];
    if ( arr.every( isArray ) ) {
      return [].concat.apply( out, arr );
    } else {
      arr.forEach( function( value ) {
        if ( isArray( value ) ) {
          flatten( value, out );
        } else {
          out.push( value );
        }
      });
    }
    return out;
  }

  // this should only be used as a timer, not as a time stamp.
  function now() {
    return window.performance.now ? window.performance.now() : Date.now();
  }

  // methods that get mixed into each monitor.
  var methods = {
    reset: function() {
      this.lastReturn = null;
      this.callCount = 0;
      this.calls = [];
      this.called = false;
    },

    returned: function( obj ) {
      return contains( pluck( this.calls, "returnValue" ), obj );
    },

    calledWith: function( obj ) {
      return contains( flatten( pluck( this.calls, "args" ) ), obj ); 
    },

    calledWithArgs: function( arr ) {
      var args = pluck( this.calls, "args" );
      return args.some( function( argSet ) {
        return arr.every( function( item ) {
          return contains( argSet, item );
        });
      });
    },

    calledWithExactArgs: function( arr ) {
      var args = pluck( this.calls, "args" );
      return args.some( function( argSet ) {
        return argSet.length === arr.length && arr.every( function( item, i ) {
          return argSet[i] === item;
        });
      });
    },

    calledOn: function( obj ) {
      return contains( pluck( this.calls, "context" ), obj );
    }
  };

  // monitor factory function
  function makeMonitor( fn ) {

    var obj, method;

    // handle call signatures
    if ( arguments.length === 0 ) {
      fn = function () {};
    } else if ( arguments.length === 1 ) {
      void 0; // placeholder for now. Do we need anything here?
    } else {
      obj = arguments[0];
      method = arguments[1];
      fn = obj[method];      
    }

    if ( !isFunction( fn ) ) {
      throw new TypeError( "monitor() requires a function or valid method name" );
    }

    var fnMonitor = function() {
      var error, returnValue, time;

      // invoke the function in try/catch
      try {
        time = now();
        returnValue = fn.apply( this, arguments );
        time = now() - time;
      } catch ( e ) {
        error = e;
      }

      // add the call info to the calls array
      fnMonitor.calls.push({
        args: slice( arguments ),
        argsStringified: JSON.stringify( slice( arguments ) ),
        returnValue: returnValue,
        timeStamp: Date.now(),
        executionTime: time,
        context: this,
        nth: fnMonitor.callCount,
        error: null || error
      });

      // update instance props
      fnMonitor.called = true;
      fnMonitor.callCount += 1;
      fnMonitor.lastReturn = returnValue;
      return returnValue;
    };

    // mixin the methods
    mixin( fnMonitor, methods );

    // set instance properties
    fnMonitor.called = false;
    fnMonitor.lastReturn = null;
    fnMonitor.callCount = 0;
    fnMonitor.calls = [];

    // if monitoring an object's method...
    // attach fnMethod to the object,
    // and add the restore method
    if ( obj && method ) {
      obj[method] = fnMonitor;
      fnMonitor.restore = function() {
        obj[method] = fn;
      };
    }

    return fnMonitor;
  }

  // expose this so users can add methods that will be mixed into monitors.
  makeMonitor.methods = methods;

  return makeMonitor;

})();