module.exports = async function() {

	const cards = await fetchNotionData();
    console.log(cards);
	return cards;
};


async function fetchNotionData() {
	// Your logic to fetch and process data
	const { Client } = require("@notionhq/client")

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
            direction: 'descending',
          },
        ]
    });
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
  
	
  };
  