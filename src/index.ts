import unified from "unified";
// FIXME: Types.
const hastUtilSelect = require("hast-util-select");
const hastUtilToText = require("hast-util-to-text");
import * as Shiki from "shiki/src/highlighter";
import rehypeParse from "rehype-parse";

const attacher: unified.Attacher<
  [
    {
      highlighter: Shiki.Highlighter;
      throwOnUnsupportedLanguage?: boolean;
    }
  ]
> = ({ highlighter, throwOnUnsupportedLanguage = false }) => (tree) => {
  for (const element of hastUtilSelect.selectAll(
    `code[class^="language-"]`,
    tree
  )) {
    const code = hastUtilToText(element);
    const language = element.properties.className[0].slice("language-".length);
    let highlightedCodeHTML: string;
    try {
      // FIXME: The ‘!’. See https://github.com/shikijs/shiki/pull/114.
      highlightedCodeHTML = highlighter.codeToHtml!(code, language);
    } catch (error) {
      if (throwOnUnsupportedLanguage) throw error;
      else continue;
    }
    const highlightedCodeHast = hastParser.parse(highlightedCodeHTML);
    element.children = hastUtilSelect.select(
      "code",
      highlightedCodeHast
    ).children;
  }
};

const hastParser = unified().use(rehypeParse, { fragment: true });

export default attacher;
