require("dotenv").config();

const Raven = require("raven");
Raven.config(process.env.SENTRY_DSN).install();

const octokit = require("@octokit/rest")();
const axios = require("axios");

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

  return axios
    .get("https://api.pinboard.in/v1/posts/add", {
      params: Object.assign({}, link, {
        auth_token: process.env.PINBOARD_TOKEN
      })
    })
    .catch(err => {
      Raven.context(function() {
        Raven.captureBreadcrumb({
          message: "Attempting to send link",
          data: link
        });
        if (err) Raven.captureException(err);
      });
    });
};

exports.default = async (req, res) => {
  const stars = await getStars();

  try {
    stars.forEach(async ({ html_url, full_name, description }) => {
      await sendLink(
        html_url,
        description ? `${full_name}: ${description}` : full_name
      );
    });
    res.end(`${stars.length} GitHub stars sent to Pinboard.`);
  } catch (e) {
    Raven.captureException(e);
    res.statusCode = 404;
    res.end(e.message);
  }
};

exports.getStars = getStars;
exports.sendLink = sendLink;
