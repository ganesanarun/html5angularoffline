using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(CodedHomes.Startup))]
namespace CodedHomes
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
