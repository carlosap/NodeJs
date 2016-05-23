namespace DataServer.Connections
{
    public class DatabaseSettings
    {
        public bool EnableTrace { get; set; }
        public SqlServerConnection SqlServerConnection { get; set; }
        public SqlServerConnection MySqlServerConnection { get; set; }

    }

}

