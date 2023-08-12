

const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");

// Sensitive data is stored in .env file
const {NOTION_KEY, NOTION_DB } = process.env;

const notion = new Client({ auth: NOTION_KEY });

async function getBlocks(block_id) {
  let { results: children } = await notion.blocks.children.list({ block_id });
  for (const child of children) {
    const grandchildren = await getBlocks(child.id);
    child.children = grandchildren;
  }
  return children;
}

async function importPages() {
  // Retrieve pages from the database.
  let { results: pages } = await notion.databases.query({
    database_id: NOTION_DB,
  });

  // Attach blocks to pages
  for (const page of pages) {
    const blocks = await getBlocks(page.id);
    page.children = blocks;
  }

  // Write the result to file.
  const outputFile = path.join(__dirname, "notion-export1.json");
  fs.writeFileSync(outputFile, JSON.stringify(pages, null, 2));
  console.log(`Wrote ${pages.length} pages to ${outputFile}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ pages }),
  };
}

exports.handler = async function (event, context) {
importPages();
};
  
