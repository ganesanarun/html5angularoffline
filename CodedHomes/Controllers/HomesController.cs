using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CodedHomes.Controllers
{
    public class HomesController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult New()
        {
            return View("edit");
        }

        public ActionResult Edit(string id, string author)
        {
            return View();
        }
    }
}
