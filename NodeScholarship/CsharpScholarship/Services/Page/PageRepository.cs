using System.Collections.Generic;
using Newtonsoft.Json;
using DataServer;
using CsharpScholarship.Model;
namespace CsharpScholarship.Services
{
    public class PageRepository : IPage
    {
        SqlServer _sqlDb;
        Dictionary<string, object> parameters;
        public string Get(string compName)
        {
            _sqlDb = new SqlServer();
            parameters = new Dictionary<string, object> {{"Name", compName}, {"TableName", "documents"}};
            string jsonResults = _sqlDb.usp_GetJsonValue("usp_GetComponentByName", parameters); 
            return jsonResults;
        }
    }
}
