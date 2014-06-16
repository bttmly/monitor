"use strict";

var err = new Error();

function add( a, b ){
  return a + b;
}

function thrower(){
  throw err;
}

describe( "monitor()", function(){  

  var noop = function (){};
  var obj = {
    method: function(){}
  };

  it( "exists", function(){
    expect( monitor ).to.be.a( "function" );
  });

  it( "can take a function as it's argument", function(){
    expect(function() {
      monitor( noop );
    }).to.not.throw();
  });

  it( "can take an object and a method name as arguments", function(){
    var m = monitor( obj, "method" );
    expect( obj.method ).to.equal( m );
  })

  it( "throws an error when passed a non-function", function(){
    expect( function() {
      monitor( true );
    }).to.throw( TypeError );
  });

  it( "returns a function", function() {
    expect( monitor( noop ) ).to.be.a( "function" );
  });

});


// instance methods
describe( "properties", function(){
  var ctx = {};
  var m = monitor( add );
  var t = monitor( thrower );
  var time = Date.now();
  m.call( ctx, 10, 20 );
  t();

  describe( ".calls", function(){
    it("exists", function(){
      expect( m.calls ).to.be.an( "array" );
    });
  
    it("stores arguments passed to each call", function(){
      expect( m.calls.length ).to.equal( 1 );
      expect( m.calls[0].args[0] ).to.equal( 10 );
      expect( m.calls[0].args[1] ).to.equal( 20 );
    });

    it("stores stringified arguments passed to each call", function(){
      expect( m.calls.length ).to.equal( 1 );
      expect( m.calls[0].argsStringified ).to.equal( '{"0":10,"1":20}' );
    });

    it( "stores return values from each call", function(){
      expect( m.calls[0].returnValue ).to.equal( 30 );
    });

    it( "stores 'this' values from each call", function(){
      expect( m.calls[0].context ).to.equal( ctx );
    });

    it( "stores errors thrown by each call", function(){
      expect( t.calls[0].error ).to.equal( err );
    });

    it( "stores the call number of each call", function(){
      expect( m.calls[0].nth ).to.equal( 0 );
    });

    // Should look for a better way to do this.
    it( "stores the time at which each call occurred", function(){
      expect( m.calls[0].timeStamp ).to.equal( time );
    });

  });

  describe( ".callCount", function(){
    it("stores the number of times the function has been called", function(){
      expect( m.callCount ).to.be.a( "number" );
      expect( m.callCount ).to.equal( 1 );
      m( 20, 40 );
      expect( m.callCount ).to.equal( 2 );
    });

  });

  describe( ".lastReturn", function(){
    it("stores the return value of the most recent call", function(){
      expect( m.lastReturn ).to.equal( 60 );
      m( 10, 20 );
      expect( m.lastReturn ).to.equal( 30 );
    })
  });



});