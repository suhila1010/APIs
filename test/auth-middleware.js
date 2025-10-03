// test/auth-middleware.test.js
const chai = require("chai");
const authMiddleware = require("../middleware/is-auth");
const jwt = require('jsonwebtoken')
const sinon = require('sinon')


const {expect} = chai;

describe("Auth middleware", function () {
  it("should throw an error if no authorization header is present", function () {
    const req = {
      get: function () {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated."
    );
  });

  it("should throw an error if the authorization header is only one string", function () {
    const req = {
      get: function () {
        return "xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

    it('should yield a userId after decoding the token', function(){
     const req = {
      get: function () {
        return "Bearer djfkajshdheufhfhdjslsks";
      },
    };
    sinon.stub(jwt, 'verify')
    jwt.verify.returns({
      userId : 'abc'
    })
    authMiddleware(req, {}, () => {})
    expect(req).to.have.property('userId');
    jwt.verify.restore()
  })

  it('should throw an error if the token cannot be verified', function(){
     const req = {
      get: function () {
        return "Bearer xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  })


});
