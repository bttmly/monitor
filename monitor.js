var monitor = (function(){

  function extend(target, source){
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  function isFunction(obj) {
    return obj && Object.prototype.toString.call(obj) === "[object Function]";
  };

  var methods = {
    calledWith: function(){

    }
  };

  return function makeMonitor(fn) {
    
    if (!isFunction(fn)) {
      throw new TypeError("Pass a function to monitor()!");
    }

    var fnMonitor = function(){
      var returnValue = fn.apply(this, arguments);
      var self = fnMonitor;

      self.calls.push({
        args: arguments,
        argsStringified: JSON.stringify(arguments),
        returnValue: returnValue,
        nth: fnMonitor.callCount
      });

      self.callCount += 1;

      return returnValue;
    };

    fnMonitor._original = fn;
    fnMonitor.callCount = 0;
    fnMonitor.calls = [];

    extend(fnMonitor, methods);

    return fnMonitor;
  };

})();