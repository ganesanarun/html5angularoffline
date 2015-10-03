using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CodedHomes.Controllers
{
    public class ManifestController : Controller
    {
        public ActionResult Index()
        {
            Response.Cache.SetCacheability(HttpCacheability.ServerAndNoCache);
            Response.ContentType = "text/cache-manifest";
            return View();
        }
    }
}