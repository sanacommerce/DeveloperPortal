using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace DeveloperPortal
{
    public class Startup
    {

        public void ConfigureServices(IServiceCollection services)
        {
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseRouting();
            app.Use(async (context, next) =>
            {
                System.Console.WriteLine("Hello World");
                string code = context.Request.Query["code"].ToString();
                if (!string.IsNullOrEmpty(code))
                {
                    string res = await DeveloperPortal.GitHub.PostAsync(code);
                    if (!string.IsNullOrEmpty(res)){
                        context.Response.Cookies.Append("access_token", res);
                    }
                }
                await next();
            }
            );
            app.UseDefaultFiles();
            app.UseStaticFiles();
        }
    }
}

