using Breathe.BigQuery.Integration.Interfaces;

namespace Breathe.BigQuery.Integration
{
    public class AirDataItem : IAirDataItem
    {
        public double Latitude { get ; set ; }

        public double Longitude { get ; set ; }

        public double Index { get; set ; }
    }
}
