using Breathe.BigQuery.Integration.Interfaces;
using Google.Cloud.BigQuery.V2;
using System;
using System.Threading.Tasks;

namespace Breathe.BigQuery.Integration
{
    public class BigQueryAirDataAccessPoint : IAirDataAccessPoint
    {
        public const string ProjectId = "breathe-306110"; // TODO: Remove hardcoded value

        public BigQueryClient Client { get; set; }

        public async Task Initialize()
        {
            this.Client = await BigQueryClient.CreateAsync(ProjectId);
        }

        public async Task SaveAirRecordsAsync(IAirDataItem[] items)
        {
            var query = $@"";

            var results = await Client.ExecuteQueryAsync(query, parameters: null);
        }
    }
}
