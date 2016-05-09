using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace CsharpScholarship
{
    class Program
    {
        static void Main(string[] args)
        {
            //1- just type to console
            Console.WriteLine("hello world");
            Console.WriteLine("=====================");
            Console.WriteLine("v1.2 - my first program");
            string response = Console.ReadLine().ToLower();
            string strCommand = string.Empty;
            do
            {
                switch (response)
                {
                    case "get state":
                        GetStateList();
                        response = Console.ReadLine().ToLower();
                        break;
                    case "details":
                        string url = "http://www.schoolsoup.com/scholarship-directory/state/alabama/3M-Scholarship-121552/";
                        strCommand = "scholarship/details";
                        RunNode(strCommand,url);
                        response = Console.ReadLine().ToLower();
                        break;
                    case "date":
                        Console.WriteLine(DateTime.Now.ToString());
                        response = Console.ReadLine().ToLower();
                        break;
                    case "clear":
                        Console.Clear();
                        response = Console.ReadLine().ToLower();
                        break;

                    default:
                        Console.WriteLine("excuse me????...");
                        response = Console.ReadLine().ToLower();
                        break;
                }

            } while (response != "exit");
        }


        static void GetStateList()
        {
            int stateMax = 51;
            int pageMax = 3;
            string strCommand = string.Empty;
            for (int i = 0; i < stateMax; i++)
            {
                for (int j = 1; j < (pageMax+1); j++)
                {
                    strCommand = $"app {i} {j}";
                    RunNode(strCommand);
                }
            }  
        }
        static void RunNode(params string[] arguments)
        {
            var commands = String.Join(" ", arguments);
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                CreateNoWindow = false,
                UseShellExecute = false,
                FileName = "C:\\Program Files\\nodejs\\node.exe",
                WindowStyle = ProcessWindowStyle.Normal,
                Arguments = $"{commands}"
            };

            try
            {
                using (Process exeProcess = Process.Start(startInfo))
                    exeProcess.WaitForExit();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }




    }
}



