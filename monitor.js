var monitor = (function(){

  // helper functions
  function mixin( target, source ){
    for ( var key in source ) {
      if ( source.hasOwnProperty( key ) ) {
        target[key] = source[key];
      }
    }
    return target;
  }

  function isFunction( obj ) {
    return obj && Object.prototype.toString.call( obj ) === "[object Function]";
  }

  function pluck( collection, key ) {
    return collection.map(function( obj ){
      return obj[key];
    });
  }

  function contains( arr, value ) {
    if ( Array.isArray( value ) ) {
      return value.every( function( v ){
        return contains( arr, v );
      });
    } else {
      return arr.indexOf( value ) > -1;
    }
  }

  function flatten( arr, out ) {
    out = out || [];
    if ( arr.every( Array.isArray ) ) {
      [].concat.apply( out, arr );
    } else {
      arr.forEach( function( value ) {
        if ( Array.isArray( value ) ) {
          flatten( value, out );
        } else {
          out.push( value );
        }
      });
    }
    return out;
  }

  var slice = Function.prototype.call.bind( [].slice );



  // methods that get mixed into each monitor.
  var methods = {
    reset: function() {
      this.lastReturn = null;
      this.callCount = 0;
      this.calls = [];
    },
    returned: function( obj ) {
      return contains( pluck( this.calls, "returnValue" ), obj );
    },
    calledWith: function( obj ) {
        return contains( flatten( pluck( this.calls, "args" ) ), obj ); 
    }
  };

  // monitor factory function
  return function makeMonitor( fn ) {

    var obj, method;

    // handle (object, method) call signature
    if ( arguments.length > 1 ) {
      obj = arguments[0];
      method = arguments[1];
      fn = obj[method];
    }

    // handle () call signature
    if ( fn == null ){
      fn = function(){};
    }
    
    if ( !isFunction( fn ) ) {
      throw new TypeError( "Pass a function to monitor()!" );
    }

    //
    var fnMonitor = function(){
      var error, returnValue, time;

      try {
        time = window.performance.now();
        returnValue = fn.apply( this, arguments );
        time = window.performance.now() - time;
      } catch ( e ) {
        error = e;
      }

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
      fnMonitor.callCount += 1;
      fnMonitor.lastReturn = returnValue;

      return returnValue;
    };

    fnMonitor.lastReturn = null;
    fnMonitor.callCount = 0;
    fnMonitor.calls = [];

    mixin( fnMonitor, methods );

    if ( obj && method ) {
      obj[method] = fnMonitor;
    }

    return fnMonitor;
  };

})();