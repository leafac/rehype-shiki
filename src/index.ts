import unified from "unified";
import unistUtilModifyChildren from "unist-util-modify-children";
// FIXME: Type.
const hastUtilToText = require("hast-util-to-text");
import * as Shiki from "shiki/dist/highlighter";
import rehypeParse from "rehype-parse";

const attacher: unified.Attacher<
  [
    {
      highlighter: Shiki.Highlighter;
      throwOnUnsupportedLanguage?: boolean;
    }
  ]
> = ({ highlighter, throwOnUnsupportedLanguage = false }) => (tree) => {
  unistUtilModifyChildren((node, index, parent) => {
    if (
      node.tagName === "pre" &&
      Array.isArray(node.children) &&
      node.children.length === 1 &&
      node.children[0].tagName === "code" &&
      typeof node.children[0].properties === "object" &&
      Array.isArray(node.children[0].properties.className) &&
      typeof node.children[0].properties.className[0] === "string" &&
      node.children[0].properties.className[0].startsWith("language-")
    ) {
      const code = hastUtilToText(node);
      const language = node.children[0].properties.className[0].slice(
        "language-".length
      );
      let highlightedCodeHTML: string;
      try {
        // FIXME: The ‘!’. See https://github.com/shikijs/shiki/pull/114.
        highlightedCodeHTML = highlighter.codeToHtml!(code, language);
      } catch (error) {
        if (throwOnUnsupportedLanguage) throw error;
        else return;
      }
      parent.children[index] = hastParser.parse(highlightedCodeHTML);
    }
  })(tree);
};

const hastParser = unified().use(rehypeParse, { fragment: true });

export default attacher;
