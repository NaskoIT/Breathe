using Breathe.Models.Sensor;
using Microsoft.AspNetCore.Mvc;

namespace Breathe.Server.Controllers
{
    public class DataController : ApiController
    {
        public IActionResult Send(SendorDataRequestModel model)
        {
            // TODO: send the data to BigQuery
            return Ok();
        }
    }
}
