import unified from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeShiki from "../src/index";
import rehypeStringify from "rehype-stringify";
import * as shiki from "shiki";

test("supported language", async () => {
  expect(
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeShiki, {
        highlighter: await shiki.getHighlighter({ theme: "light-plus" }),
      })
      .use(rehypeStringify)
      .processSync(
        `
\`\`\`javascript
return unified()
\`\`\`
`
      )
      .toString()
  ).toMatchInlineSnapshot(
    `"<pre class=\\"shiki\\" style=\\"background-color: #FFFFFF\\"><code><span class=\\"line\\"><span style=\\"color: #AF00DB\\">return</span><span style=\\"color: #000000\\"> </span><span style=\\"color: #795E26\\">unified</span><span style=\\"color: #000000\\">()</span></span></code></pre>"`
  );
});

test("text", async () => {
  expect(
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeShiki, {
        highlighter: await shiki.getHighlighter({ theme: "light-plus" }),
      })
      .use(rehypeStringify)
      .processSync(
        `
\`\`\`text
Leandro Facchinetti
\`\`\`
`
      )
      .toString()
  ).toMatchInlineSnapshot(`
    "<pre class=\\"shiki\\" style=\\"background-color: #FFFFFF\\"><code><span class=\\"line\\"><span style=\\"color: #000000\\">Leandro Facchinetti
    </span></span></code></pre>"
  `);
});

test("unsupported language", async () => {
  expect(
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeShiki, {
        highlighter: await shiki.getHighlighter({ theme: "light-plus" }),
      })
      .use(rehypeStringify)
      .processSync(
        `
\`\`\`not-a-language
Leandro Facchinetti
\`\`\`
`
      )
      .toString()
  ).toMatchInlineSnapshot(`
    "<pre><code class=\\"language-not-a-language\\">Leandro Facchinetti
    </code></pre>"
  `);
});

test("throw on unsupported language", async () => {
  await expect(async () => {
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeShiki, {
        highlighter: await shiki.getHighlighter({ theme: "light-plus" }),
        throwOnUnsupportedLanguage: true,
      })
      .use(rehypeStringify)
      .processSync(
        `
\`\`\`not-a-language
Leandro Facchinetti
\`\`\`
`
      )
      .toString();
  }).rejects.toThrowErrorMatchingInlineSnapshot(
    `"No language registration for not-a-language"`
  );
});
