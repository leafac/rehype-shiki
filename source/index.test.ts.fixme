import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeShiki from ".";
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

test("multiple highlighters", async () => {
  expect(
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeShiki, {
        highlighter: {
          light: await shiki.getHighlighter({ theme: "light-plus" }),
          dark: await shiki.getHighlighter({ theme: "dark-plus" }),
        },
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
  ).toMatchInlineSnapshot(`
    "
                <div class=\\"rehype-shiki\\">
                  
                        <div class=\\"light\\">
                          <pre class=\\"shiki\\" style=\\"background-color: #FFFFFF\\"><code><span class=\\"line\\"><span style=\\"color: #AF00DB\\">return</span><span style=\\"color: #000000\\"> </span><span style=\\"color: #795E26\\">unified</span><span style=\\"color: #000000\\">()</span></span></code></pre>
                        </div>
                      
                        <div class=\\"dark\\">
                          <pre class=\\"shiki\\" style=\\"background-color: #1E1E1E\\"><code><span class=\\"line\\"><span style=\\"color: #C586C0\\">return</span><span style=\\"color: #D4D4D4\\"> </span><span style=\\"color: #DCDCAA\\">unified</span><span style=\\"color: #D4D4D4\\">()</span></span></code></pre>
                        </div>
                      
                </div>
              "
  `);
});
