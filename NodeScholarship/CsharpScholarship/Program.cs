using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using CsharpScholarship.Model;
using CsharpScholarship.Services;

namespace CsharpScholarship
{
    class Program
    {
        
        static void Main(string[] args)
        {
            //1- just type to console
            ShowHeader();
            string response = Console.ReadLine().ToLower();
            string strCommand = string.Empty;
            do
            {
                switch (response)
                {
                    case "1":
                    case "get states":
                        GetStateList();
                        response = Console.ReadLine().ToLower();
                        break;
                    case "2":
                    case "get files":
                        GetDetailPages();
                        response = Console.ReadLine().ToLower();
                        break;

                    case "3":
                    case "save db":
                        AddAllProviders();
                        Console.WriteLine("Done");
                        response = Console.ReadLine().ToLower();
                        break;

                    case "4":
                    case "get state list":
                        getStateList();
                        response = Console.ReadLine().ToLower();
                        break;

                    case "5":
                    case "get page":
                        Console.Clear();
                        Console.WriteLine("Enter Page Name:");
                        Console.Write(">");
                        string pageName = Console.ReadLine();
                        getPageByName(pageName);
                        Console.WriteLine("[Press Enter to Continue]:");
                        response = Console.ReadLine().ToLower();
                        ShowHeader();
                        response = Console.ReadLine().ToLower();
                        break;

                    case "6":
                    case "get media":
                        Console.Clear();
                        Console.WriteLine("Enter Media Name (i.e. header):");
                        Console.Write(">");
                        string mediaName = Console.ReadLine();
                        getMediasByName(mediaName);
                        Console.WriteLine("[Press Enter to Continue]:");
                        response = Console.ReadLine().ToLower();
                        ShowHeader();
                        response = Console.ReadLine().ToLower();
                        break;

                    case "?":
                    case "help":
                        ShowHeader();
                        response = Console.ReadLine().ToLower();
                        break;
                    case "clear":
                        Console.Clear();
                        response = Console.ReadLine().ToLower();
                        break;

                    
                    default:
                        Console.Write(">");
                        response = Console.ReadLine().ToLower();
                        break;
                }

            } while (response != "exit");
        }

        static void ShowHeader()
        {
            Console.Clear();
            Console.WriteLine("Scholarship Scrapper App");
            Console.WriteLine("v1.3 - Demostrates the ability to run Node Js and C#");
            Console.WriteLine("Node Js have outstanding scrapping helpers.");
            Console.WriteLine("================================================");
            Console.WriteLine("1- get states        -> scrapes and creates state name folders");
            Console.WriteLine("2- get files         -> scrapes retrieves all references");
            Console.WriteLine("3- save db           -> insert schemas into DB");
            Console.WriteLine("4- get state list    -> retrieves states");
            Console.WriteLine("5- get page          -> retrieves page properties");
            Console.WriteLine("6- get media         -> retrieves media lists (header)");
            Console.WriteLine();
            Console.WriteLine();
            Console.Write(">");
        }


        static void getMediasByName(string mediaName)
        {
           List<Media> medias = new List<Media>();
           MediaRepository media = new MediaRepository();
            medias = media.Get(mediaName);


        }
        static void getPageByName(string pageName)
        {
            Page pageResults = new Page();
            PageRepository page = new PageRepository();
            string jsonResults = page.Get(pageName);
            if (!string.IsNullOrWhiteSpace(jsonResults))
            {
                var jsPage = JsonConvert.DeserializeObject<dynamic>(jsonResults);
                foreach (var props in jsPage)
                {
                    foreach (var item in props)
                    {
                        if (item.Name.ToString().ToLower() == "id") pageResults.Id = item.Value;
                        if (item.Name.ToString().ToLower() == "guid") pageResults.Guid = item.Value;
                        if (item.Name.ToString().ToLower() == "documenttype") pageResults.Type = item.Value;
                        if (item.Name.ToString().ToLower() == "name") pageResults.Name = item.Value;
                        if (item.Name.ToString().ToLower() == "displayorder") pageResults.DisplayOrder = item.Value;
                        if (item.Name.ToString().ToLower() == "urlsegment") pageResults.UrlSegment = item.Value;
                        if (item.Name.ToString().ToLower() == "hidden") pageResults.Hidden = (item.Value == "1");
                        if (item.Name.ToString().ToLower() == "metatitle") pageResults.MetaKeywords = item.Value;
                        if (item.Name.ToString().ToLower() == "metadescription") pageResults.MetaDescription = item.Value;
                        if (item.Name.ToString().ToLower() == "isgallery") pageResults.IsGallery = (item.Value == "1");
                        if (item.Name.ToString().ToLower() == "seotargetphrase") pageResults.SEoTargetPhrase = item.Value;
                        if (item.Name.ToString().ToLower() == "revealinnavigation") pageResults.RevealInNavigation = (item.Value == "1");
                        if (item.Name.ToString().ToLower() == "requiresssl") pageResults.RequiresSsl = (item.Value == "1");
                        if (item.Name.ToString().ToLower() == "publishon") pageResults.PublishOn = item.Value;
                        if (item.Name.ToString().ToLower() == "blockanonymousaccess") pageResults.BlockAnonymousAccess = (item.Value == "1");
                        if (item.Name.ToString().ToLower() == "bodycontent") pageResults.BodyContent = item.Value;
                        if (item.Name.ToString().ToLower() == "metakeywords") pageResults.MetaKeywords = item.Value;
                        if (item.Name.ToString().ToLower() == "customfooterscripts") pageResults.CustomFooterScripts = item.Value;
                        if (item.Name.ToString().ToLower() == "customheaderscripts") pageResults.CustomHeaderScripts = item.Value;
                        if (item.Name.ToString().ToLower() == "pagetemplateid") pageResults.PageTemplateId = item.Value;
                        if (item.Name.ToString().ToLower() == "redirecturl") pageResults.RedirectUrl = item.Value;
                        if (item.Name.ToString().ToLower() == "permanent") pageResults.Permanent = item.Value;
                        if (item.Name.ToString().ToLower() == "featureimage") pageResults.FeatureImage = item.Value;
                        if (item.Name.ToString().ToLower() == "allowpaging") pageResults.AllowPaging = item.Value;
                        if (item.Name.ToString().ToLower() == "redirecturl") pageResults.RedirectUrl = item.Value;
                        if (item.Name.ToString().ToLower() == "thumbnailimage") pageResults.ThumbnailImage = item.Value;

                    }
                }
            }


            if(pageResults.Id !=null)
                Console.WriteLine($"Found: {pageResults.Id} - {pageResults.Name}");
            else
                Console.WriteLine("Page Not Found");


        }


        static void getStateList()
        {
            List<State> states = new List<State>();
            List<string> results = ScholarshipContext.GetStateList();
            foreach (var state in results.Select((value, index) => new {value, index}))
            {
                states.Add(new State()
                {
                    Id = state.index,
                    Name = state.value
                });
                Console.WriteLine($"{state.index + 1} {state.value}");
            }
                

        }
        static void GetDetailPages()
        {
            string strCommand = "scholarship/details";
            List<string> stateList = GetStateAllFiles();
            foreach (var url in stateList)
            {
                var fileId = url.Split('-').LastOrDefault().Replace("/", "").Trim();
                if(File.Exists("output/"+fileId+".json"))
                    continue;

                RunNode(strCommand, url);
            }
        }

        static void AddAllProviders()
        {
            int ctr = 0;
            Provider provider = new Provider();
            string[] files = Directory.GetFiles("output", "*.json", SearchOption.TopDirectoryOnly);
            foreach (var file in files)
            {
                string source = File.ReadAllText(file);
                var item = JsonConvert.DeserializeObject<dynamic>(source);
                try
                {
                    string name = item.name.Value.Replace(" s", "");
                    string strAmount = item.amount.Value;
                    item.amount = item.amount.ToString().Replace(" ", "");
                    item.amount = item.amount.ToString().Replace("$", "");
                    item.amount = item.amount.ToString().Replace("/semester", "");
                    item.amount = item.amount.ToString().Replace("/year", "");
                    item.amount = item.amount.ToString().Replace("+", "");
                    item.amount = item.amount.ToString().Replace("/yr", "");
                    item.amount = item.amount.ToString().Replace("/month", "");
                    decimal amount;
                    if (item.amount.ToString() == "Varies")
                        amount = 2000;

                    if (item.amount.Value.ToString().Contains("-"))
                    {
                        string[] amountArray = item.amount.ToString().Split('-');
                        string tempAmount = amountArray.LastOrDefault();
                        if (tempAmount.Length <= 0)
                            tempAmount = amountArray.FirstOrDefault();


                       amount = GetAmountValue(tempAmount);

                    }
                    else
                    {
                        
                        try
                        {

                            amount = GetAmountValue(item.amount.Value.ToString());
                        }
                        catch (Exception ex1)
                        {
                            Console.WriteLine(item.amount.Value.ToString());
                            amount = 2000;
                        }
                        
                    }

                    string state = item.state.Value; 
                    string strId = state + item.id.Value;
                    if (state.Contains("-"))
                        state = state.Replace("-", " ");



                    ctr++;
                    if (ctr == 5000)
                    {
                        Console.Clear();
                        System.Threading.Thread.Sleep(1000);
                        ctr = 0;
                    }
                    Console.Write(".");
                    provider.CliendId = strId;
                    provider.Name = name;
                    provider.Type = item.type.Value;
                    provider.Website = item.website.Value;
                    provider.Url = item.url.Value;
                    provider.Value = amount.ToString(CultureInfo.InvariantCulture);
                    provider.StrValue = strAmount;
                    provider.Description = item.description.Value;
                    provider.State = state;
                    provider.ShortUrl = string.Empty;
                    provider.Misc = string.Empty;
                    ScholarshipContext.AddNewProvider(provider);

                }
                catch (Exception ex)
                {
                    
                    Console.WriteLine(ex.ToString());
                }

            }

        }

        private static decimal GetAmountValue(string tempAmount)
        {
            decimal amount;
            string strToken = tempAmount.ToLower().Trim();
            switch (strToken)
            {

                case "":
                case "guaranteed":
                case "matches":
                case "partial":
                case "room":
                case "aprox.":
                case "approx.":
                case "check":
                case "stipend":
                case "tuition/fees":
                case "tuition/books":
                case "varies":
                case "vaires":
                case "varies.":
                case "up":
                case "half":
                case "1/2":
                case "required":
                case "student":
                case "50%":
                case "20%":
                case "10%":
                case "40%":
                case "30%":
                    amount = 20000;
                    break;
                case "max.":
                case "ride":
                case "tuition":
                case "tution":
                case "tuition,":
                case "full":
                    amount = 40000;
                    break;

                case "fees":
                case "about":
                case "textbooks":
                case "covers":
                    amount = 1000;
                    break;
                default:
                    amount = decimal.Parse(tempAmount);
                    break;
            }
            return amount;
        }

        static List<string> GetStateAllFiles()
        {
            var stateList = new List<string>();
            string[] files =  Directory.GetFiles("output", "*_*.json",SearchOption.AllDirectories);
            foreach (var file in files)
            {
                string source = File.ReadAllText(file);
                var items = JsonConvert.DeserializeObject<dynamic>(source);
                foreach (var item in items)
                    stateList.Add($"{item.Link}");
            }
            return stateList;
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
                WindowStyle = ProcessWindowStyle.Hidden,
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




