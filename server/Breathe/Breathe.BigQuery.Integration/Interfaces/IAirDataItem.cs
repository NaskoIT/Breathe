using System;
using System.Collections.Generic;
using System.Text;

namespace Breathe.BigQuery.Integration.Interfaces
{
    public interface IAirDataItem
    {
        DateTime Timestamp { get; set; }

        double Latitude { get; set; }

        double Longitude { get; set; }

        double Index { get; set; }
    }
}
