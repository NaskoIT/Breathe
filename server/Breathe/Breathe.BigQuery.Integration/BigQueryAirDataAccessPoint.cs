using Breathe.BigQuery.Integration.Interfaces;
using Google.Cloud.BigQuery.V2;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Breathe.BigQuery.Integration
{
    public class BigQueryAirDataAccessPoint : IAirDataAccessPoint
    {
        public const string ProjectId = "breathe-306110"; // TODO: Remove hardcoded value
        public const string DatasetId = "AirDataEntries";
        public const string TableId = "air_data_entries";

        private BigQueryClient Client { get; set; }

        private BigQueryTable Table { get; set; }

        public async Task Initialize()
        {
            this.Client = await BigQueryClient.CreateAsync(ProjectId);
            this.Table = await this.Client.GetTableAsync(DatasetId, TableId);
        }

        public async Task SaveAirRecordsAsync(IEnumerable<IAirDataItem> items)
        {
            var submissionTime = DateTime.UtcNow;
            var rows = new List<BigQueryInsertRow>();
            foreach (var item in items)
            {
                rows.Add(new BigQueryInsertRow
                                {
                                    { "latitude", item.Latitude },
                                    { "longitude", item.Longitude },
                                    { "index", item.Index },
                                    { "measurement_date_time", submissionTime }
                                });
            }

            await this.Table.InsertRowsAsync(rows);
        }
    }
}
