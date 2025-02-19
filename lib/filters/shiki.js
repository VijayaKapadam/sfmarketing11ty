const shiki = require("shiki");

const isShikierEnabled = (lang) => !lang.toLowerCase().includes("{!sh!}");

const isTokenComment = (token) =>
  (token.explanation || []).some((explanation) =>
    explanation.scopes.some((scope) => scope.scopeName.startsWith("comment."))
  );

const resolveCommandShortcuts = (command) =>
  ({
    "**": "focus",
    "++": "add",
    "--": "remove",
    "~~": "highlight",
  }[command] || command);

const extractLineShikierCommands = (line) => {
  const shikierCommandsExtractor = /\[sh!(?<commands>[^\]]*)\]/gu;
  const commands = [];
  const comments = line.filter(isTokenComment);
  for (const token of comments) {
    const commandsString = shikierCommandsExtractor.exec(token.content)?.groups
      ?.commands;
    if (commandsString) {
      commands.push(...commandsString.trim().split(/\s/u));
      line.splice(
        line.findIndex((t) => t === token),
        1
      );
    }
  }

  return commands;
};

const extractAllLinesWithCommands = (lines) => {
  /**
   * @type {Map<number, string[]>}
   */
  const linesWithCommands = new Map();
  lines.forEach((line, lineIndex) => {
    const commands = extractLineShikierCommands(line);
    if (commands.length > 0) {
      linesWithCommands.set(lineIndex + 1, commands);
    }
  });
  return linesWithCommands;
};

const parseNumberLineSpec = (lineSpec, lineNumber) => {
  const lineSpecParts = lineSpec.split(",").map((l) => parseInt(l, 10));
  switch (lineSpecParts.length) {
    case 1:
      return {
        end: lineNumber + lineSpecParts[0],
        start: lineNumber,
      };
    case 2:
      return {
        end: lineNumber + lineSpecParts[0] + lineSpecParts[1],
        start: lineNumber + lineSpecParts[0],
      };
    default:
      throw new Error(`Invalid line spec ${lineSpec}`);
  }
};

const applyCommandToLines = (lineRange, command, lineCommands) => {
  for (let i = lineRange.start; i <= lineRange.end; i++) {
    if (!lineCommands.has(i)) {
      lineCommands.set(i, []);
    }
    lineCommands.get(i).push(command);
  }
};

const parseLineSpec = (lineSpec, lineNumber, command, rangeStarts) => {
  switch (lineSpec.toLowerCase()) {
    case "":
      return { end: lineNumber, start: lineNumber };
    case "start":
      rangeStarts.set(
        command,
        Math.min(rangeStarts.get(command) || Infinity, lineNumber)
      );
      return;
    case "end": {
      const start = rangeStarts.get(command) || 0;
      rangeStarts.delete(command);
      return { end: lineNumber, start };
    }
    default:
      return parseNumberLineSpec(lineSpec, lineNumber);
  }
};

const applyRemainingStartedCommands = (
  rangeStarts,
  totalLines,
  linesApplyCommands
) => {
  for (const [command, start] of rangeStarts) {
    for (let i = start; i < totalLines; i++) {
      if (!linesApplyCommands.has(i)) {
        linesApplyCommands.set(i, []);
      }
      linesApplyCommands.get(i).push(command);
    }
  }
};

const parseRawCommand = (rawCommand) => {
  const commandParts = rawCommand.split(":");
  if (commandParts.length < 2) {
    commandParts.push("");
  }
  const lineSpec = commandParts.pop();
  const cleanCommand = resolveCommandShortcuts(commandParts.join(":"));
  return { cleanCommand, lineSpec };
};

const lineCommandsToAppliedLines = (linesWithCommands, totalLines) => {
  /**
   * @type {Map<number, string[]>}
   */
  const linesApplyCommands = new Map();
  /**
   * @type {Map<string, number>}
   */
  const rangeStarts = new Map();
  for (const [lineNumber, commands] of linesWithCommands.entries()) {
    for (const rawCommand of commands) {
      const { cleanCommand, lineSpec } = parseRawCommand(rawCommand);
      const lineRange = parseLineSpec(
        lineSpec,
        lineNumber,
        cleanCommand,
        rangeStarts
      );
      if (lineRange) {
        applyCommandToLines(lineRange, cleanCommand, linesApplyCommands);
      }
    }
  }

  applyRemainingStartedCommands(rangeStarts, totalLines, linesApplyCommands);

  return linesApplyCommands;
};

const getLineOptions = (tokenized) => {
  const lineOptions = [];
  const linesWithCommands = extractAllLinesWithCommands(tokenized);
  const linesApplyCommands = lineCommandsToAppliedLines(
    linesWithCommands,
    tokenized.length
  );
  for (const [lineNumber, commands] of linesApplyCommands.entries()) {
    lineOptions.push({
      classes: commands.map((command) => `sh--${command}`),
      line: lineNumber,
    });
  }
  return lineOptions;
};

/**
 * Highlight code
 * @param {string} code Code to highlight
 * @param {string} lang Language name
 * @param {shiki.Highlighter} highlighter
 * @returns {string} Highlighted code
 */
const highlight = (code, lang, highlighter) => {
  const [cleanLang] = lang.split("{");
  const tokenized = highlighter.codeToThemedTokens(code, cleanLang);
  const lineOptions = isShikierEnabled(lang) ? getLineOptions(tokenized) : [];

  const theme = highlighter.getTheme();
  return shiki.renderToHtml(tokenized, {
    bg: theme.bg,
    fg: theme.fg,
    langId: cleanLang,
    lineOptions,
  });
};

module.exports = (eleventyConfig, { theme = "dark-plus" } = {}) => {
  // empty call to notify 11ty that we use this feature
  // eslint-disable-next-line no-empty-function
  eleventyConfig.amendLibrary("md", () => {});

  eleventyConfig.on("eleventy.before", async () => {
    const highlighter = await shiki.getHighlighter({ theme });
    eleventyConfig.amendLibrary("md", (mdLib) =>
      mdLib.set({
        highlight: (code, lang) => highlight(code, lang, highlighter),
      })
    );
  });
};