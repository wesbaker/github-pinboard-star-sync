require("dotenv").config();

const Raven = require("raven");
Raven.config(process.env.SENTRY_DSN).install();

const octokit = require("@octokit/rest")();
const Pinboard = require("node-pinboard");
const pinboard = new Pinboard(process.env.PINBOARD_TOKEN);

const getStars = () =>
  octokit.activity
    .listReposStarredByUser({ username: process.env.GITHUB_USERNAME })
    .then(stars => stars.data);

const sendLink = (url, description) => {
  const link = {
    url,
    description,
    tags: "programming",
    toread: "no"
  };

  if (process.env.NODE_ENV !== "production") {
    console.info("🚀 Sending Link", link);
    return;
  }

  pinboard.add(link, (err, res) => {
    if (err) Raven.captureException(err);
    console.info(res);
  });
};

const sync = () =>
  getStars()
    .then(stars =>
      stars.forEach(({ html_url, full_name, description }) =>
        sendLink(
          html_url,
          description ? `${full_name}: ${description}` : full_name
        )
      )
    )
    .catch(error => Raven.captureException(error));

exports.getStars = getStars;
exports.sendLink = sendLink;

sync();
