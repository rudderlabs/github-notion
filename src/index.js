const core = require("@actions/core");

function createOrUpdateInNotion() {
  console.log(process.env.GITHUB_EVENT_PATH)
}

function printProcessEnv() {
  console.log(process.env)
}

createOrUpdateInNotion();
printProcessEnv();


