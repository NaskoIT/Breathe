using Breathe.BigQuery.Integration;
using System;
using System.Threading.Tasks;

namespace Breathe.ConsoleTests
{
    class Program
    {
        static async Task Main(string[] args)
        {
            if (Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS") == null)
            {
                Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", @".\Breathe-BigQuery-Credentials-FullAccount.json");
            }

            var random = new Random();
            var bigQuery = new BigQueryAirDataAccessPoint();
            await bigQuery.Initialize();
            await bigQuery.SaveAirRecordsAsync(new[] 
            {
                new AirDataItem() 
                { 
                    Latitude = 42.659,
                    Longitude = 23.348,
                    Index = random.NextDouble()
                }
            });
        }
    }
}
