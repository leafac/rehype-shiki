import unified from "unified";
import unistUtilModifyChildren from "unist-util-modify-children";
// FIXME: Type.
const hastUtilToText = require("hast-util-to-text");
import * as Shiki from "shiki";
import rehypeParse from "rehype-parse";
import html from "@leafac/html";

const attacher: unified.Plugin<
  [
    {
      highlighter: Shiki.Highlighter | { [key: string]: Shiki.Highlighter };
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
      let output: string;
      try {
        if (typeof highlighter.codeToHtml === "function")
          output = highlighter.codeToHtml(code, language);
        else
          output = html`
            <div class="rehype-shiki">
              $${Object.entries(highlighter).map(
                ([name, highlighter]: [string, Shiki.Highlighter]) =>
                  html`
                    <div class="${name}">
                      $${highlighter.codeToHtml(code, language)}
                    </div>
                  `
              )}
            </div>
          `;
      } catch (error) {
        if (throwOnUnsupportedLanguage) throw error;
        else return;
      }
      parent.children[index] = hastParser.parse(output);
    }
  })(tree);
};

const hastParser = unified().use(rehypeParse, { fragment: true });

export default attacher;
