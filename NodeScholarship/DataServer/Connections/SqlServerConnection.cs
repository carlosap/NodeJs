namespace DataServer.Connections
{
    public class SqlServerConnection
    {
        public string HostingEnvironment { get; set; }
        public string DevConnectionString { get; set; }
        public string StagingConnectionString { get; set; }
        public string ConnectionString { get; set; }
        public int TimeOut { get; set; }

    }
}
