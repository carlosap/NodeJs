using System;
using System.Collections.Generic;
using System.Linq;
using CsharpScholarship.Model;
using DataServer;
using Newtonsoft.Json;

namespace CsharpScholarship.Services
{
    public class MediaRepository:IMedia
    {
        SqlServer _sqlDb;
        Dictionary<string, object> parameters;
        public List<Media> Get(string compName)
        {
            var medias = new List<Media>();
            _sqlDb = new SqlServer();
            parameters = new Dictionary<string, object> {{"Name", compName}, {"TableName", "medias"}};
            var jsonResults = _sqlDb.usp_GetJsonValue("usp_GetComponentByName", parameters);
            if (string.IsNullOrWhiteSpace(jsonResults)) return medias;
            var jsPage = JsonConvert.DeserializeObject<List<dynamic>>(jsonResults);
            if (!jsPage.Any()) return medias;
            foreach (var media in jsPage)
                Console.WriteLine(media.FileName.Value);


            return medias;
        }


    }
}


