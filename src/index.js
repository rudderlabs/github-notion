const core = require("@actions/core");
const fs = require("fs");
const axios = require("axios");
const notionPageEndpoint = "https://api.notion.com/v1/pages";

async function createOrUpdateInNotion() {
  let event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf-8"));
  console.log(JSON.stringify(event, null, 2))
  event = event["issue"];
  const respo = await createIssue(event);
}

async function createIssue(event) {
  const token = core.getInput('token')
  const dbID = core.getInput('dbID')
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const body = {
    parent: {
      database_id: dbID,
    },
    properties: {
      "Issue Number": {
        type: "number",
        number: event.number,
      },
      "Issue URL": {
        type: "url",
        url: event.html_url,
      },
      User: {
        type: "select",
        select: {
          name: event.user.login,
        },
      },
      Comments: {
        type: "number",
        number: event.comments,
      },
      State: {
        type: "select",
        select: {
          name: event.state,
        },
      },
      event: {
        type: "text",
        text: {
          content: JSON.stringify(event)
        }
      },
      Title: {
        id: "title",
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: event.title,
            },
            plain_text: event.title,
          },
        ],
      },
    },
  };

  addToBody(body, event.closed_at, "Closed at", (param) => {
    return {
      type: "date",
      date: {
        start: param.replace("Z", "+00:00"),
      },
    };
  });

  addToBody(body, event.updated_at, "Updated at", (param) => {
    return {
      type: "date",
      date: {
        start: param.replace("Z", "+00:00"),
      },
    };
  });

  addToBody(body, event.created_at, "Created at", (param) => {
    return {
      type: "date",
      date: {
        start: param.replace("Z", "+00:00"),
      },
    };
  });

  addToBody(body, event.pull_request, "PR", (param) => {
    return {
      type: "url",
      url: param.html_url,
    };
  });

  addToBody(body, event.assignees, "Assignees", (param) => {
    return {
      type: "multi_select",
      multi_select: param.map((a) => {
        return { name: a.login };
      }),
    };
  });

  addToBody(body, event.assignee, "Assignee", (param) => {
    return {
      type: "select",
      select: {
        name: param.login,
      },
    };
  });

  try {
    const resp = await axios.default.post(notionPageEndpoint, body, config);
    console.log("Response", JSON.stringify(resp.data, null, 2));
    return resp;
  } catch (e) {
    console.log(e);
  }
}

function addToBody(body, checkParam, key, f) {
  if (checkParam) {
    body.properties[key] = f(checkParam);
  }
}

createOrUpdateInNotion();
