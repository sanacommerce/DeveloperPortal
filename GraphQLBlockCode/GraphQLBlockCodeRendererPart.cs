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
            return token.Lang == "graph" || token.Lang == "graphql" || token.Lang == "gql";
        }

        public override StringBuffer Render(IMarkdownRenderer renderer, MarkdownCodeBlockToken token, MarkdownBlockContext context)
        {
            StringBuffer result = "<pre><code class=\"";
            result += renderer.Options.LangPrefix;
            result += "graphql";
            result += "\">";
            result += token.Code;
            result += "\n</code></pre>";
            result += "<a class=\"open-in-playground-btn\" target=\"_blank\" href=\"playground.html?graphrequest=";
            result += WebUtility.UrlEncode(token.Code);
            result += "\">Open in playground</a>";
            return result;
        }
    }
}
