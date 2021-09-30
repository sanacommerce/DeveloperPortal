
using System.Threading.Tasks;
using Newtonsoft.Json;

using System.Net.Http;
using System.Collections.Generic;

namespace DeveloperPortal
{
    public static class GitHub{
        private static readonly string git_api = @"https://github.com/login/oauth/access_token";

        private static readonly string client_secret;

        private static readonly string client_id;
        private static readonly HttpClient client = new HttpClient();

        public class JSON: Dictionary<string, string> { }

        public class JSONRESPONSE{
            public string access_token;
            public string scope;
            public string token_type;
        }
        public static async Task<string> PostAsync(string data, string method = "POST")
        {
            JSON requestBody = new JSON();
            requestBody.Add("code", data);
            requestBody.Add("client_id", client_id);
            requestBody.Add("client_secret", client_secret); 
            string json = JsonConvert.SerializeObject(requestBody);
            StringContent httpContnet = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(git_api, httpContnet);
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            JSONRESPONSE responseJson = (JSONRESPONSE) JsonConvert.DeserializeObject(responseBody);
            return responseJson.access_token;
        }


    }
}
