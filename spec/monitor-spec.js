(function( monitor, describe, expect, it ){
  "use strict";

  var err = new Error();

  function add( a, b ) {
    if ( arguments.length > 2 ) {
      throw err;
    }
    return a + b;
  }

  function isWithinOf( a, b, n ) {
    return Math.abs( a - b ) <= n;
  }

  describe( "monitor()", function() {  

    var noop = function () {};
    var obj = {
      method: function() {}
    };

    it( "exists", function(){
      expect( monitor ).to.be.a( "function" );
    });

    it( "can take a function as it's argument", function(){
      expect(function() {
        monitor( noop );
      }).to.not.throw();
    });

    it( "can take an object and a method name as arguments", function() {
      var m = monitor( obj, "method" );
      expect( obj.method ).to.equal( m );
    });

    it( "throws an error when passed a non-function as it's only argument", function() {
      expect( function() {
        monitor( true );
      }).to.throw( TypeError );
    });

    it( "returns a function", function() {
      expect( monitor( noop ) ).to.be.a( "function" );
    });

  });


  // instance methods
  describe( "properties", function() {
    var addMonitor;
    var ctx = {};
    beforeEach(function(){
      addMonitor = monitor( add );
    });

    describe( ".calls", function() {
      it("exists", function() {
        expect( addMonitor.calls ).to.be.an( "array" );
      });
    
      it("stores arguments passed to each call", function() {
        addMonitor( 10, 20 );
        expect( addMonitor.calls.length ).to.equal( 1 );
        expect( addMonitor.calls[0].args[0] ).to.equal( 10 );
        expect( addMonitor.calls[0].args[1] ).to.equal( 20 );
      });

      it("stores stringified arguments passed to each call", function() {
        addMonitor( 10, 20 );
        expect( addMonitor.calls.length ).to.equal( 1 );
        expect( addMonitor.calls[0].argsStringified ).to.equal( "[10,20]" );
      });

      it( "stores return values from each call", function() {
        addMonitor( 10, 20 );
        expect( addMonitor.calls[0].returnValue ).to.equal( 30 );
      });

      it( "stores 'this' values from each call", function() {
        addMonitor.call( ctx, 10, 20 );
        expect( addMonitor.calls[0].context ).to.equal( ctx );
      });

      it( "stores the call number of each call", function() {
        addMonitor( 10, 20 );
        expect( addMonitor.calls[0].nth ).to.equal( 0 );
      });

      it( "stores errors thrown by each call", function() {
        addMonitor( 10, 20, 30 );
        expect( addMonitor.calls[0].error ).to.equal( err );
      });

      // Should look for a better way to do this.
      it( "stores the time at which each call occurred", function() {
        var time = Date.now();
        addMonitor( 10, 20 );
        // this occasionally fails if you check for straight equality.. w/in 1ms is close enough.
        expect( isWithinOf( addMonitor.calls[0].timeStamp, time, 1 ) ).to.equal( true );
      });

      it( "stores the execution time of each call", function() {
        addMonitor( 10, 20 );
        expect( addMonitor.calls[0].executionTime ).to.be.a( "number" );
        expect( addMonitor.calls[0].executionTime ).to.be.lessThan( 1 );
      });

    });

    describe( ".callCount", function() {
      var addMonitor;
      var ctx = {};
      beforeEach(function() {
        addMonitor = monitor( add );
      });

      it("stores the number of times the function has been called", function() {
        addMonitor( 10, 20 )
        expect( addMonitor.callCount ).to.be.a( "number" );
        expect( addMonitor.callCount ).to.equal( 1 );
        addMonitor( 20, 40 );
        expect( addMonitor.callCount ).to.equal( 2 );
      });

    });

    describe( ".lastReturn", function(){
      it("stores the return value of the most recent call", function() {
        addMonitor( 10, 20 );
        expect( addMonitor.lastReturn ).to.equal( 30 );
        addMonitor( 20, 40 );
        expect( addMonitor.lastReturn ).to.equal( 60 );
      });
    });

  });

})( monitor, describe, expect, it );