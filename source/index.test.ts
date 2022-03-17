import unifiedTypes, { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype, { HastRoot } from "remark-rehype";
import rehypeShiki from ".";
import rehypeStringify from "rehype-stringify";
import * as shiki from "shiki";
import { visit as unistUtilVisit } from "unist-util-visit";

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
  ).toMatchInlineSnapshot(
    `"<pre class=\\"shiki\\" style=\\"background-color: #FFFFFF\\"><code><span class=\\"line\\"><span style=\\"color: #000000\\">Leandro Facchinetti</span></span></code></pre>"`
  );
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

test("preserve position", async () => {
  const positionSaver: unifiedTypes.Plugin = () => (tree) => {
    unistUtilVisit(tree, (node) => {
      if ((node as any).properties !== undefined && node.position !== undefined)
        (node as any).properties.dataPosition = JSON.stringify(node.position);
    });
  };
  expect(
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeShiki, {
        highlighter: await shiki.getHighlighter({ theme: "light-plus" }),
      })
      .use(positionSaver)
      .use(rehypeStringify)
      .processSync(
        `
Some

text

before

\`\`\`javascript
return unified()
\`\`\`

and

some

after
`
      )
      .toString()
  ).toMatchInlineSnapshot(`
    "<p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:2,&#x22;column&#x22;:1,&#x22;offset&#x22;:1},&#x22;end&#x22;:{&#x22;line&#x22;:2,&#x22;column&#x22;:5,&#x22;offset&#x22;:5}}\\">Some</p>
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:4,&#x22;column&#x22;:1,&#x22;offset&#x22;:7},&#x22;end&#x22;:{&#x22;line&#x22;:4,&#x22;column&#x22;:5,&#x22;offset&#x22;:11}}\\">text</p>
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:6,&#x22;column&#x22;:1,&#x22;offset&#x22;:13},&#x22;end&#x22;:{&#x22;line&#x22;:6,&#x22;column&#x22;:7,&#x22;offset&#x22;:19}}\\">before</p>
    <pre class=\\"shiki\\" style=\\"background-color: #FFFFFF\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:8,&#x22;column&#x22;:1,&#x22;offset&#x22;:21},&#x22;end&#x22;:{&#x22;line&#x22;:10,&#x22;column&#x22;:4,&#x22;offset&#x22;:55}}\\"><code data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:54,&#x22;offset&#x22;:53},&#x22;end&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:253,&#x22;offset&#x22;:252}}\\"><span class=\\"line\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:60,&#x22;offset&#x22;:59},&#x22;end&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:246,&#x22;offset&#x22;:245}}\\"><span style=\\"color: #AF00DB\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:79,&#x22;offset&#x22;:78},&#x22;end&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:121,&#x22;offset&#x22;:120}}\\">return</span><span style=\\"color: #000000\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:121,&#x22;offset&#x22;:120},&#x22;end&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:158,&#x22;offset&#x22;:157}}\\"> </span><span style=\\"color: #795E26\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:158,&#x22;offset&#x22;:157},&#x22;end&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:201,&#x22;offset&#x22;:200}}\\">unified</span><span style=\\"color: #000000\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:201,&#x22;offset&#x22;:200},&#x22;end&#x22;:{&#x22;line&#x22;:1,&#x22;column&#x22;:239,&#x22;offset&#x22;:238}}\\">()</span></span></code></pre>
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:12,&#x22;column&#x22;:1,&#x22;offset&#x22;:57},&#x22;end&#x22;:{&#x22;line&#x22;:12,&#x22;column&#x22;:4,&#x22;offset&#x22;:60}}\\">and</p>
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:14,&#x22;column&#x22;:1,&#x22;offset&#x22;:62},&#x22;end&#x22;:{&#x22;line&#x22;:14,&#x22;column&#x22;:5,&#x22;offset&#x22;:66}}\\">some</p>
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:16,&#x22;column&#x22;:1,&#x22;offset&#x22;:68},&#x22;end&#x22;:{&#x22;line&#x22;:16,&#x22;column&#x22;:6,&#x22;offset&#x22;:73}}\\">after</p>"
  `);

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
      .use(positionSaver)
      .use(rehypeStringify)
      .processSync(
        `
Some

text

before

\`\`\`javascript
return unified()
\`\`\`

and

some

after
`
      )
      .toString()
  ).toMatchInlineSnapshot(`
    "<p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:2,&#x22;column&#x22;:1,&#x22;offset&#x22;:1},&#x22;end&#x22;:{&#x22;line&#x22;:2,&#x22;column&#x22;:5,&#x22;offset&#x22;:5}}\\">Some</p>
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:4,&#x22;column&#x22;:1,&#x22;offset&#x22;:7},&#x22;end&#x22;:{&#x22;line&#x22;:4,&#x22;column&#x22;:5,&#x22;offset&#x22;:11}}\\">text</p>
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:6,&#x22;column&#x22;:1,&#x22;offset&#x22;:13},&#x22;end&#x22;:{&#x22;line&#x22;:6,&#x22;column&#x22;:7,&#x22;offset&#x22;:19}}\\">before</p>

                  <div class=\\"rehype-shiki\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:8,&#x22;column&#x22;:1,&#x22;offset&#x22;:21},&#x22;end&#x22;:{&#x22;line&#x22;:10,&#x22;column&#x22;:4,&#x22;offset&#x22;:55}}\\">
                    
                          <div class=\\"light\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:4,&#x22;column&#x22;:23,&#x22;offset&#x22;:81},&#x22;end&#x22;:{&#x22;line&#x22;:6,&#x22;column&#x22;:29,&#x22;offset&#x22;:412}}\\">
                            <pre class=\\"shiki\\" style=\\"background-color: #FFFFFF\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:25,&#x22;offset&#x22;:125},&#x22;end&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:283,&#x22;offset&#x22;:383}}\\"><code data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:78,&#x22;offset&#x22;:178},&#x22;end&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:277,&#x22;offset&#x22;:377}}\\"><span class=\\"line\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:84,&#x22;offset&#x22;:184},&#x22;end&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:270,&#x22;offset&#x22;:370}}\\"><span style=\\"color: #AF00DB\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:103,&#x22;offset&#x22;:203},&#x22;end&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:145,&#x22;offset&#x22;:245}}\\">return</span><span style=\\"color: #000000\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:145,&#x22;offset&#x22;:245},&#x22;end&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:182,&#x22;offset&#x22;:282}}\\"> </span><span style=\\"color: #795E26\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:182,&#x22;offset&#x22;:282},&#x22;end&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:225,&#x22;offset&#x22;:325}}\\">unified</span><span style=\\"color: #000000\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:225,&#x22;offset&#x22;:325},&#x22;end&#x22;:{&#x22;line&#x22;:5,&#x22;column&#x22;:263,&#x22;offset&#x22;:363}}\\">()</span></span></code></pre>
                          </div>
                        
                          <div class=\\"dark\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:8,&#x22;column&#x22;:23,&#x22;offset&#x22;:456},&#x22;end&#x22;:{&#x22;line&#x22;:10,&#x22;column&#x22;:29,&#x22;offset&#x22;:786}}\\">
                            <pre class=\\"shiki\\" style=\\"background-color: #1E1E1E\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:25,&#x22;offset&#x22;:499},&#x22;end&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:283,&#x22;offset&#x22;:757}}\\"><code data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:78,&#x22;offset&#x22;:552},&#x22;end&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:277,&#x22;offset&#x22;:751}}\\"><span class=\\"line\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:84,&#x22;offset&#x22;:558},&#x22;end&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:270,&#x22;offset&#x22;:744}}\\"><span style=\\"color: #C586C0\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:103,&#x22;offset&#x22;:577},&#x22;end&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:145,&#x22;offset&#x22;:619}}\\">return</span><span style=\\"color: #D4D4D4\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:145,&#x22;offset&#x22;:619},&#x22;end&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:182,&#x22;offset&#x22;:656}}\\"> </span><span style=\\"color: #DCDCAA\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:182,&#x22;offset&#x22;:656},&#x22;end&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:225,&#x22;offset&#x22;:699}}\\">unified</span><span style=\\"color: #D4D4D4\\" data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:225,&#x22;offset&#x22;:699},&#x22;end&#x22;:{&#x22;line&#x22;:9,&#x22;column&#x22;:263,&#x22;offset&#x22;:737}}\\">()</span></span></code></pre>
                          </div>
                        
                  </div>
                
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:12,&#x22;column&#x22;:1,&#x22;offset&#x22;:57},&#x22;end&#x22;:{&#x22;line&#x22;:12,&#x22;column&#x22;:4,&#x22;offset&#x22;:60}}\\">and</p>
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:14,&#x22;column&#x22;:1,&#x22;offset&#x22;:62},&#x22;end&#x22;:{&#x22;line&#x22;:14,&#x22;column&#x22;:5,&#x22;offset&#x22;:66}}\\">some</p>
    <p data-position=\\"{&#x22;start&#x22;:{&#x22;line&#x22;:16,&#x22;column&#x22;:1,&#x22;offset&#x22;:68},&#x22;end&#x22;:{&#x22;line&#x22;:16,&#x22;column&#x22;:6,&#x22;offset&#x22;:73}}\\">after</p>"
  `);
});

test("only one root for separate transforms", async () => {
  const ast = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(function () {
      this.Compiler = (html) => html;
    }).processSync(`
\`\`\`js
console.log(value == null)
\`\`\`

  `).result as HastRoot;
  const transformedAst = unified()
    .use(rehypeShiki, {
      highlighter: await shiki.getHighlighter({ theme: "light-plus" }),
    })
    .runSync(ast);

  let rootCount = 0;
  unistUtilVisit(transformedAst, "root", () => rootCount++);
  expect(rootCount).toBe(1);
});
