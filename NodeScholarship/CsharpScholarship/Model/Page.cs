using System;

namespace CsharpScholarship.Model
{
    public class Page
    {
        public DateTime PublishOn { get; set; }
        public string Guid { get; set; }
        public string Id { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public int DisplayOrder { get; set; }
        public int PageSize { get; set; }
        public int PageTemplateId { get; set; }
        public string UrlSegment { get; set; }
        public bool Hidden { get; set; }
        public bool AllowPaging { get; set; }
        public bool RevealInNavigation { get; set; }
        public bool RequiresSsl { get; set; }
        public bool BlockAnonymousAccess { get; set; }
        public bool IsGallery { get; set; }
        public string MetaTitle { get; set; }
        public string MetaDescription { get; set; }    
        public string SEoTargetPhrase { get; set; }         
        public string BodyContent { get; set; }
        public string MetaKeywords { get; set; }
        public string CustomFooterScripts { get; set; }
        public string CustomHeaderScripts { get; set; }
        public string Permanent { get; set; }
        public string FeatureImage { get; set; }
        public string ThumbnailImage { get; set; }
        public string RedirectUrl { get; set; }


    }
}
