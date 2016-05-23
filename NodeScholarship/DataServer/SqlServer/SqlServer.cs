using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;

namespace DataServer
{
    public class SqlServer : DataServerBase
    {
        public SqlCommand SqlCommand { get; set; }
        public override DatabaseServerType ServerType{get { return DatabaseServerType.SqlServer; }}
        public SqlServer(){InitialiseInternal();}
        protected sealed override void InitialiseInternal() => SqlCommand = new SqlCommand();
        protected override string GetConnectionStringInternal()
        {
            return "Data Source=.;Initial Catalog=EJPARSE;Integrated Security=True";
        }

        protected override int GetTimeOutInternal()
        {
            return 180;
        }

        public string usp_Exec(string storeProc, Dictionary<string, object> parameters)
        {
                string results = string.Empty;
                try
                {
                    using (var con = new SqlConnection(GetConnectionStringInternal()))
                    {
                        con.Open();
                        using (var command = new SqlCommand(storeProc, con))
                        {
                            command.CommandType = CommandType.StoredProcedure;
                            command.CommandText = storeProc;
                            command.CommandTimeout = GetTimeOutInternal();
                            if (parameters.Count > 0)
                                foreach (var param in parameters)
                                    command.Parameters.AddWithValue(param.Key, param.Value);

                            command.ExecuteReader();
                        }
                    }
                }
                catch (Exception ex){Trace.TraceError(ex.ToString());}
                finally{SqlCommand.Dispose();}
                return results;

        }

        public string usp_GetJsonValue(string storeProc, Dictionary<string, object> parameters = null)
        {

                string results = string.Empty;
                try
                {
                        using (var con = new SqlConnection(GetConnectionStringInternal()))
                        {
                            con.Open();
                            using (var command = new SqlCommand(storeProc, con))
                            {
                                command.CommandType = CommandType.StoredProcedure;
                                command.CommandText = storeProc;
                                command.CommandTimeout = GetTimeOutInternal();
                                if (parameters?.Count > 0)
                                    foreach (var param in parameters)
                                        command.Parameters.AddWithValue(param.Key, param.Value);


                                using (var reader = command.ExecuteReader())
                                    while (reader.Read())
                                        results = reader["json"]?.ToString().Trim().Replace("\r", "").Replace("\n", "").Replace("\t", "");
                            }
                        }
                }
                catch (Exception ex){Trace.TraceError(ex.ToString());}
                finally{SqlCommand.Dispose();}
                return results;
        }
    }
}

