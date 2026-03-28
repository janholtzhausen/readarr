using NzbDrone.Core.Annotations;

namespace NzbDrone.Core.Indexers.PubCrawler
{
    public enum PubCrawlerSource
    {
        [FieldOption("Archive.org")]
        ArchiveOrg = 0,

        [FieldOption("OceanOfPDF")]
        OceanOfPdf = 1
    }
}
