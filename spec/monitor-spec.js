describe("monitor()", function(){

  "use strict";

  var noop = function(){};

  it("exists", function(){
    expect( monitor ).to.be.a( "function" );
  });

  it("takes a function as it's argument", function(){

    expect(function() {
      monitor( noop );
    }).to.not.throw();

    expect( function() {
      monitor( true );
    }).to.throw(TypeError);

  });

  it("returns a function", function() {
    expect( monitor( noop ) ).to.be.a( "function" );
  });

});