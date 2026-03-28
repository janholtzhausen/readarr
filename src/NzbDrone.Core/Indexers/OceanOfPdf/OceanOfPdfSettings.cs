using FluentValidation;
using NzbDrone.Core.Annotations;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Indexers.OceanOfPdf
{
    public class OceanOfPdfSettingsValidator : AbstractValidator<OceanOfPdfSettings>
    {
        public OceanOfPdfSettingsValidator()
        {
            RuleFor(c => c.BaseUrl).ValidRootUrl();
            RuleFor(c => c.PubcrawlerUrl)
                .ValidRootUrl()
                .When(c => !string.IsNullOrWhiteSpace(c.PubcrawlerUrl));
        }
    }

    public class OceanOfPdfSettings : IIndexerSettings
    {
        private static readonly OceanOfPdfSettingsValidator Validator = new ();

        public OceanOfPdfSettings()
        {
            BaseUrl = "https://oceanofpdf.com/";
        }

        [FieldDefinition(0, Label = "URL", HelpText = "Base URL of the direct-download site")]
        public string BaseUrl { get; set; }

        [FieldDefinition(1, Label = "Pubcrawler URL", HelpText = "Standalone crawler endpoint, e.g. http://pubcrawler:8080", Advanced = true)]
        public string PubcrawlerUrl { get; set; }

        public string FlareSolverrUrl { get; set; }

        [FieldDefinition(2, Type = FieldType.Number, Label = "Early Download Limit", Unit = "days", HelpText = "Time before release date Readarr will download from this indexer, empty is no limit", Advanced = true)]
        public int? EarlyReleaseLimit { get; set; }

        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult(Validator.Validate(this));
        }
    }
}
