using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HmiEditor.Controllers
{
    public class HmiController : Controller
    {
        // GET: Hmi
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult HmiView()
        {
            var topoName = Request["topoName"];
            ViewData["topoName"] = topoName;
            return View();
        }

        public ActionResult FabricEditor()
        {
            var topoName = Request["topoName"];
            ViewData["topoName"] = topoName;
            
            return View();
        }

        public JsonResult GetTopo(string topoId)
        {
            string json;
            using (FileStream fs = new FileStream(GetFile(topoId), FileMode.Open))
            {
                using (StreamReader sr = new StreamReader(fs))
                {
                    json = sr.ReadToEnd();
                }
            }
            var result = new
            {
                result = "ok",
                topologyJson = json
            };
            return Json(result);
        }

        [HttpPost]
        public JsonResult SaveTopo(string topoId,string topoJson)
        {
            using (FileStream fs = new FileStream(GetFile(topoId), FileMode.Create))
            {
                using (StreamWriter sr = new StreamWriter(fs))
                {
                    sr.WriteLine(topoJson);
                }
            }
            return Json(new { result = "ok", topologyJson=topoJson });
        }

        private string GetFile(string name)
        {
            return System.Web.HttpContext.Current.Server.MapPath("../content/topojson/fabricTopology-" + name + ".json");
        }
    }
}