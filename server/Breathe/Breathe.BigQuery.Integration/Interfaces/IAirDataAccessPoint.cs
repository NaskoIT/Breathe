using System;
using System.Threading.Tasks;

namespace Breathe.BigQuery.Integration.Interfaces
{
    public interface IAirDataAccessPoint
    {
        Task SaveAirRecordsAsync(IAirDataItem[] items);
    }
}
