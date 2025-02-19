module.exports = (config) => {
  config.addPassthroughCopy('src/assets/img/**/*');
  config.addPassthroughCopy({ 'src/posts/img/**/*': 'assets/img/' });


  config.addWatchTarget("src/assets/js/");

  config.addLayoutAlias('default', 'layouts/default.njk');
  config.addLayoutAlias('successlayout', 'layouts/successlayout.njk');
  config.addLayoutAlias('post', 'layouts/post.njk');

  config.addFilter('readableDate', require('./lib/filters/readableDate'));
  config.addFilter('minifyJs', require('./lib/filters/minifyJs'));

  config.addTransform('minifyHtml', require('./lib/transforms/minifyHtml'));

  config.addCollection('posts', require('./lib/collections/posts'));
  config.addCollection('tagList', require('./lib/collections/tagList'));
  config.addCollection('pagedPosts', require('./lib/collections/pagedPosts'));
  config.addCollection('pagedPostsByTag', require('./lib/collections/pagedPostsByTag'));

  const shikier = require('./lib/filters/shiki.js'); 
  config.addPlugin(shikier); 


  config.addNunjucksAsyncShortcode("fetchApiData", async function() {
    const response = await fetch('/api/fetchNotion'); // Adjust the URL accordingly
    const data = await response.json();

    // Process and manipulate data if needed
    const processedData = data.response.results.map(item => {
      // Manipulate item properties if needed
      return item;
    });

    // Return processed data as JSON string
    return JSON.stringify(processedData);
  });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    // pathPrefix: "/subfolder/",
    templateFormats: ['md', 'njk', 'html'],
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };


};


