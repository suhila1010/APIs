const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");


const User = require("../models/user");
const FeedControllers = require("../controllers/feed");
const io = require('../socket')

const url =
  "mongodb+srv://sohilaahmed678:2UU03m0bUVXDjUwd@cluster0.9ijbpjx.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0";

describe("Feed Controller", function () {
  before(function (done) {
     sinon.stub(io, "getIo").returns({ emit: () => {} });

    mongoose
      .connect(url)
      .then((result) => {
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "test",
          posts: [],
          _id: "5c0f66b979af55031b347277",
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });
  it("should add a created post to the posts of the creator.", function (done) {


    const req = {
      body: {
        title:"Test Post",
        content:"A Test Post"
      },
      file:{
        path:"abc"
      },
      userId:'5c0f66b979af55031b347277'
    };
    const res ={ status:function() {
      return this
    }, json:function(){} }
    FeedControllers.createPost(req, res, () => {}).then((savedUser) => {
      expect(savedUser).to.have.property('posts');
      expect(savedUser.posts).to.have.length(1)
      done()
    })
  });
      after(function (done) {
      User.deleteMany({})
        .then(() => {
          return mongoose.disconnect();
        })
        .then(() => {
          io.getIo.restore(); 
          done();
        });
    });
});
