const subject = require("./check");
const Pinboard = require("node-pinboard");

describe("sendLink", function() {
  beforeEach(function() {
    process.env.PINBOARD_USERNAME = "user";
    process.env.PINBOARD_API_KEY = "1234567890";
  });

  it("sends the correct info", function() {
    const info = jest.fn();
    global.console.info = info;
    subject.sendLink("http://example.com", "title: description");
    expect(info).toHaveBeenCalledWith("🚀 Sending Link", {
      url: "http://example.com",
      description: "title: description",
      tags: "programming",
      toread: "no"
    });
  });
});
