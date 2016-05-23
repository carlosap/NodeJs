using System;
namespace DataServer
{
    public abstract  class DataServerBase: IDatabase
    {

        public abstract DatabaseServerType ServerType { get; }
        protected abstract void InitialiseInternal();
        protected abstract string GetConnectionStringInternal();
        protected abstract int GetTimeOutInternal();

        protected DataServerBase Current
        {
            get { return this; }
        }


        public void Initialise()
        {
            try
            {
                InitialiseInternal();
            }
            catch (Exception ex)
            {

            }
        }

        public string GetConnectionString()
        {
            return Current.GetConnectionStringInternal();
        }

        public int GetTimeOut()
        {
            return Current.GetTimeOutInternal();
        }

    }
}
