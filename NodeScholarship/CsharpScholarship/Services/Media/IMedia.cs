using System.Collections.Generic;
using System.Threading.Tasks;
using CsharpScholarship.Model;

namespace CsharpScholarship.Services
{
    public interface IMedia
    {
        List<Media> Get(string compName);
    }
}




