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

  var slice = Function.prototype.call.bind( [].slice );



  // methods that get mixed into each monitor.
  var methods = {
    reset: function(){
      this.lastReturn = null;
      this.callCount = 0;
      this.calls = [];
    },
    returned: function( obj ){
      return pluck( this.calls, "returnValue" ).indexOf( obj ) > -1;
    },
  };



  // monitor factory function
  return function makeMonitor( fn ) {

    var obj, method;

    if ( arguments.length > 1 ) {
      obj = arguments[0];
      method = arguments[1];
      fn = obj[method];
    }

    if ( fn == null ){
      fn = function(){};
    }
    
    if ( !isFunction( fn ) ) {
      throw new TypeError( "Pass a function to monitor()!" );
    }

    //
    var fnMonitor = function(){
      var error, returnValue;

      try {
        returnValue = fn.apply( this, arguments );
      } catch ( e ) {
        error = e;
      }

      fnMonitor.calls.push({
        args: slice( arguments ),
        argsStringified: JSON.stringify( arguments ),
        returnValue: returnValue,
        timeStamp: Date.now(),
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