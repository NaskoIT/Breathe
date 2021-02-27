using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Breathe.BigQuery.Integration.Interfaces
{
    public interface IAirDataAccessPoint
    {
        Task SaveAirRecordsAsync(IEnumerable<IAirDataItem> items);
    }
}
