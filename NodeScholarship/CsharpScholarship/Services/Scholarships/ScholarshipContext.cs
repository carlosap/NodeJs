using System;
using System.Collections.Generic;
using DataServer;
using CsharpScholarship.Model;
using Newtonsoft.Json;

namespace CsharpScholarship.Services
{
    public static class ScholarshipContext
    {
        static SqlServer _sqlDb;
        static Dictionary<string, object> parameters;

        public static string AddNewProvider(Provider provider)
        {
            _sqlDb = new SqlServer();
            parameters = new Dictionary<string, object>();
            string jsonResults;
            try
            {
                parameters.Add("CliendId", provider.CliendId);
                parameters.Add("Name", provider.Name);
                parameters.Add("Type", provider.Type);
                parameters.Add("Website", provider.Website);
                parameters.Add("Url", provider.Url);
                parameters.Add("Value", provider.Value);
                parameters.Add("StrValue", provider.StrValue);
                parameters.Add("Description", provider.Description);
                parameters.Add("State", provider.State);
                parameters.Add("ShortUrl", provider.ShortUrl);
                parameters.Add("Misc", provider.Misc);
                jsonResults = _sqlDb.usp_Exec("usp_InsertScholarshipProvider", parameters);

            }
            catch (Exception ex)
            {
                jsonResults = string.Empty;
            }
            return jsonResults;

        }

        public static List<string> GetStateList()
        {
            List<string> stateList = new List<string>();

            string results = string.Empty;
            _sqlDb = new SqlServer();
            results = _sqlDb.usp_GetJsonValue("usp_GetScholarshipStateList");
            var states = JsonConvert.DeserializeObject<dynamic>(results);
            foreach (var stateItem in states)
                stateList.Add(stateItem.state.Value);

            return stateList;

        }
    }

}
