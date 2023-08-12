const { Client } = require("@notionhq/client")
const fs = require("fs");
const path = require("path");
const {NOTION_KEY, NOTION_DB } = process.env;

// Initializing a client
const notion = new Client({
  auth: NOTION_KEY
})


exports.handler = async function (event, context) {
    try {
    const response = await notion.databases.query({
        database_id: NOTION_DB,
        filter: {
          or: [
             {
              property: 'Published Date',
              date: {
                is_not_empty: true,
              },
            },
          ],
        },
        sorts: [
          {
            property: 'Published Date',
            direction: 'ascending',
          },
        ]
    });

    // Write the result to file.
  const outputFile = path.join(__dirname, "notion-export.json");
  fs.writeFileSync(outputFile, JSON.stringify(response, null, 2));
  console.log(`Wrote ${response.length} pages to ${outputFile}`);


    return {
      statusCode: 200,
      body: JSON.stringify({ response }),
    };
} catch(e){ console.error(e);
    return {
        statusCode: 500,
        body: e.toString(),
      };}
  };
  