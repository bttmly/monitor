(function( monitor, describe, expect, it ){
  "use strict";

  var should = chai.should();

  var err = new Error();
  
  function noop() {}

  function add( a, b ) {
    if ( arguments.length > 2 ) {
      throw err;
    }
    return a + b;
  }

  function isWithinOf( a, b, n ) {
    return Math.abs( a - b ) <= n;
  }

  function personFactory() {
    return {
      age: 30,
      gender: "male",
      name: "John Doe",
      job: "BART Operator",
      get: function( prop ) {
        return this[prop];
      }
    };
  }

  describe( "monitor()", function() {  

    var noop = function () {};
    var obj = {
      method: function() {}
    };

    it( "exists", function() {
      ( monitor ).should.be.a( "function" );
    });

    it( "can take a function as it's argument", function() {
      (function() {
        monitor( noop );
      }).should.not.throw();
    });

    it( "throws an error when passed a non-function as it's only argument", function() {
      ( function() {
        monitor( {} );
      }).should.throw( TypeError );
    });

    it( "can take an object and a method name as arguments", function() {
      var person = personFactory();
      ( function() {
        monitor( person, "get" );
      }).should.not.throw();
    });

    it( "throws an error when passed an object and a property that isn't a method", function() {
      var person = personFactory();
      expect( function() {
        monitor( person, "age" );
      }).to.throw( TypeError );
    });

    it( "returns a function", function() {
      expect( monitor( noop ) ).to.be.a( "function" );
    });

  });

  // instance methods
  describe( "wrapping a standalone function", function() {
    var addMonitor;
    var ctx = {};
    
    beforeEach(function(){
      addMonitor = monitor( add );
    });

    describe( ".calls", function() {
      it( "exists", function() {
        ( addMonitor.calls ).should.be.an( "array" );
      });
    
      it( "stores arguments passed to each call", function() {
        addMonitor( 10, 20 );
        ( addMonitor.calls.length ).should.equal( 1 );
        ( addMonitor.calls[0].args[0] ).should.equal( 10 );
        ( addMonitor.calls[0].args[1] ).should.equal( 20 );
      });

      it( "stores stringified arguments passed to each call", function() {
        addMonitor( 10, 20 );
        ( addMonitor.calls.length ).should.equal( 1 );
        ( addMonitor.calls[0].argsStringified ).should.equal( "[10,20]" );
      });

      it( "stores return values from each call", function() {
        addMonitor( 10, 20 );
        ( addMonitor.calls[0].returnValue ).should.equal( 30 );
      });

      it( "stores 'this' values from each call", function() {
        addMonitor.call( ctx, 10, 20 );
        ( addMonitor.calls[0].context ).should.equal( ctx );
      });

      it( "stores the call number of each call", function() {
        addMonitor( 10, 20 );
        ( addMonitor.calls[0].nth ).should.equal( 0 );
      });

      it( "stores errors thrown by each call", function() {
        addMonitor( 10, 20, 30 );
        ( addMonitor.calls[0].error ).should.equal( err );
      });

      // Should look for a better way to do this.
      it( "stores the time at which each call occurred", function() {
        var time = Date.now();
        addMonitor( 10, 20 );
        // this occasionally fails if you check for straight equality.. w/in 1ms is close enough.
        ( isWithinOf( addMonitor.calls[0].timeStamp, time, 1 ) ).should.equal( true );
      });

      it( "stores the execution time of each call", function() {
        addMonitor( 10, 20 );
        ( addMonitor.calls[0].executionTime ).should.be.a( "number" );
        ( addMonitor.calls[0].executionTime ).should.be.lessThan( 1 );
      });

    });

    describe( ".callCount", function() {
      var addMonitor;
      var ctx = {};
      beforeEach(function() {
        addMonitor = monitor( add );
      });

      it( "stores the number of times the function has been called", function() {
        addMonitor( 10, 20 );
        ( addMonitor.callCount ).should.be.a( "number" );
        ( addMonitor.callCount ).should.equal( 1 );
        addMonitor( 20, 40 );
        ( addMonitor.callCount ).should.equal( 2 );
      });

    });

    describe( ".lastReturn", function(){
      it( "stores the return value of the most recent call", function() {
        addMonitor( 10, 20 );
        ( addMonitor.lastReturn ).should.equal( 30 );
        addMonitor( 20, 40 );
        ( addMonitor.lastReturn ).should.equal( 60 );
      });
    });

  });

  describe( "methods", function() {
    
    var noopMonitor;

    beforeEach(function(){
      noopMonitor = monitor( noop );
    });

    describe( ".calledWith()", function() {
      it( "checks if the monitor has been called with a given argument", function() {
        noopMonitor( 10, 20 );
        ( noopMonitor.calledWith( 10 ) ).should.equal( true );
        ( noopMonitor.calledWith( 20 ) ).should.equal( true );
        ( noopMonitor.calledWith( 30 ) ).should.equal( false );
      });
    });

    describe( ".calledWithArgs()", function() {
      it( "checks if the monitor has been called with a given set of arguments at one time, without regard to order or completeness.", function() {
        noopMonitor( 10, 20, 30 );
        ( noopMonitor.calledWithArgs([ 20, 10 ]) ).should.equal( true );
      });
    });

    describe( ".calledWithExactArgs()", function() {
      it( "checks if the monitor has been called with an exact set of arguments", function() {
        noopMonitor( 10, 20, 30 );
        ( noopMonitor.calledWithExactArgs([ 10, 20, 30 ]) ).should.equal( true );
        ( noopMonitor.calledWithExactArgs([ 10, 20 ]) ).should.equal( false );
        ( noopMonitor.calledWithExactArgs([ 10 ]) ).should.equal( false );
        ( noopMonitor.calledWithExactArgs([ 30, 20, 10 ]) ).should.equal( false );
      });
    });

  });

  describe( "wrapping an object method", function() {

    var person;
    var original;
    var monitoredGet;

    beforeEach( function() {
      person = personFactory();
      original = person.get;
      monitoredGet = monitor( person, "get" );
    });

    it( "replaces the target method on the object", function() {
      ( person.get ).should.equal( monitoredGet );
      ( person.get ).should.not.equal( original );
    });

    it( "is executed in the correct context", function() {
      ( person.get( "age" ) ).should.equal( 30 );
      ( person.get.calls[0].context ).should.equal( person );
      should.not.exist( monitoredGet( "age" ) );
    });

    it( "re-attaches the original function with .restore()", function() {
      ( person.get ).should.equal( monitoredGet );
      person.get.restore();
      ( person.get ).should.equal( original );
    });

    it( "has the expected properties and methods", function() {
      ( person.get ).should.have.ownProperty( "calls" );
      ( person.get ).should.have.ownProperty( "callCount" );
      ( person.get ).should.have.ownProperty( "lastReturn" );
      ( person.get ).should.have.ownProperty( "reset" );
      ( person.get ).should.have.ownProperty( "returned" );
      ( person.get ).should.have.ownProperty( "calledWith" );
      ( person.get ).should.have.ownProperty( "calledOn" );
    });

  });



})( monitor, describe, expect, it );