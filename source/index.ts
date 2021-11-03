import unifiedTypes, { unified } from "unified";
import unistUtilModifyChildrenTypes, {
  modifyChildren as unistUtilModifyChildren,
} from "unist-util-modify-children";
import HastUtilToTextTypes, {
  toText as hastUtilToText,
} from "hast-util-to-text";
import * as Shiki from "shiki";
import rehypeParse from "rehype-parse";
import html from "@leafac/html";

const attacher: unifiedTypes.Plugin<
  [
    {
      highlighter: Shiki.Highlighter | { [key: string]: Shiki.Highlighter };
      throwOnUnsupportedLanguage?: boolean;
    }
  ]
> =
  ({ highlighter, throwOnUnsupportedLanguage = false }) =>
  (tree) => {
    unistUtilModifyChildren((node, index, parent) => {
      if (
        node.type === "node" &&
        node.data?.tagName === "pre" &&
        Array.isArray(node.data?.children) &&
        node.data?.children.length === 1 &&
        node.data?.children[0].tagName === "code" &&
        typeof node.data?.children[0].properties === "object" &&
        Array.isArray(node.data?.children[0].properties.className) &&
        typeof node.data?.children[0].properties.className[0] === "string" &&
        node.data?.children[0].properties.className[0].startsWith("language-")
      ) {
        const code = hastUtilToText(node as HastUtilToTextTypes.HastNode);
        const language = node.data?.children[0].properties.className[0].slice(
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
    })(tree as unistUtilModifyChildrenTypes.Parent);
  };

const hastParser = unified().use(rehypeParse, { fragment: true });

export default attacher;
