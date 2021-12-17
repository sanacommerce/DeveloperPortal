using Microsoft.DocAsCode.Dfm;
using Microsoft.DocAsCode.MarkdownLite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace GraphQLBlockCode
{
    public class GraphQLBlockCodeRendererPart : DfmCustomizedRendererPartBase<IMarkdownRenderer, MarkdownCodeBlockToken, MarkdownBlockContext>
    {
        public override string Name => "GraphQLBlockCodeRendererPart";

        public override bool Match(IMarkdownRenderer renderer, MarkdownCodeBlockToken token, MarkdownBlockContext context)
        {
            return token.Lang == "graphql" || token.Lang == "graphql-admin";
        }

        public override StringBuffer Render(IMarkdownRenderer renderer, MarkdownCodeBlockToken token, MarkdownBlockContext context)
        {
            StringBuffer result = "<pre><code class=\"";
            result += renderer.Options.LangPrefix;
            result += "graphql";
            result += "\">";
            result += token.Code;
            result += "\n</code></pre>";
            result += "<a class=\"button secondary\" target=\"_blank\" href=\"/contracts/graph-apis/playground.html?graphrequest=";
            result += WebUtility.UrlEncode(token.Code);
            result += token.Lang == "graphql-admin" ? "&admin=True" : ""; 
            result += "\">Open in playground</a>";
            return result;
        }
    }
}
