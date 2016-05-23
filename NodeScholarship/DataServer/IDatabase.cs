
namespace DataServer
{
    public interface IDatabase
    {
        DatabaseServerType ServerType { get; }
        void Initialise();
        string GetConnectionString();
        int GetTimeOut();
        
    }
}
