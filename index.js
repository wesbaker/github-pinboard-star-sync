require("dotenv").config();

const GitHubApi = require("github");
const Pinboard = require("node-pinboard");
const pinboard = new Pinboard(
  `${process.env.PINBOARD_USERNAME}:${process.env.PINBOARD_API_KEY}`
);

const getStars = () =>
  new GitHubApi().activity
    .getStarredReposForUser({
      username: process.env.GITHUB_USERNAME
    })
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
    if (err) console.error(err);
    console.info(res);
  });
};

const sync = () => {
  getStars().then(stars =>
    stars.forEach(star => {
      const { html_url, full_name, description } = star.repo;
      const title = description ? `${full_name}: ${description}` : full_name;
      sendLink(html_url, title);
    })
  );
};

exports.getStars = getStars;
exports.sendLink = sendLink;

sync();
