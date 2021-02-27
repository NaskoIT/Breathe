using System;

namespace Breathe.BigQuery.Integration.Interfaces
{
    public interface IAirDataItem
    {
        double Latitude { get; set; }

        double Longitude { get; set; }

        double Index { get; set; }
    }
}
