using System;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Net.Http;
using System.Collections.Generic;
using System.Web;

namespace DeveloperPortal
{
    public static class GitHub{
        private static readonly string git_api = @"https://github.com/login/oauth/access_token";

        private static readonly string client_secret = Environment.GetEnvironmentVariable("CLIENT_SECRET");

        private static readonly string client_id = Environment.GetEnvironmentVariable("CLIENT_ID");
        private static readonly HttpClient client = new HttpClient();

        public class JSON: Dictionary<string, string> { }

        public class JSONRESPONSE{
            public string access_token;
            public string scope;
            public string token_type;
        }

        public static void addHeaders(){
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        }
        public static async Task<string> PostAsync(string data, string method = "POST")
        {
            var uriBuilder = new UriBuilder(git_api);
            var query = HttpUtility.ParseQueryString(uriBuilder.Query);
            query.Add("code", data);
            query.Add("client_id", client_id);
            query.Add("client_secret", client_secret); 
            uriBuilder.Query = query.ToString();
            string longurl = uriBuilder.ToString();
            StringContent emptyContent = new StringContent("");
            HttpResponseMessage response = await client.PostAsync(longurl, emptyContent);
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            System.Console.WriteLine(responseBody);
            JSONRESPONSE responseJson = JsonConvert.DeserializeObject<JSONRESPONSE>(responseBody);
            return responseJson.access_token;
        }


    }
}
