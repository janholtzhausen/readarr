using FluentValidation;
using NzbDrone.Core.Annotations;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Indexers.PubCrawler
{
    public class PubCrawlerSettingsValidator : AbstractValidator<PubCrawlerSettings>
    {
        public PubCrawlerSettingsValidator()
        {
            RuleFor(c => c.PubcrawlerUrl).ValidRootUrl();
        }
    }

    public class PubCrawlerSettings : IIndexerSettings
    {
        private static readonly PubCrawlerSettingsValidator Validator = new ();

        public PubCrawlerSettings()
        {
            PubcrawlerUrl = "http://192.168.1.4:18080/";
        }

        [FieldDefinition(0, Label = "PubCrawler URL", HelpText = "Standalone crawler endpoint, e.g. http://pubcrawler:8080")]
        public string PubcrawlerUrl { get; set; }

        public string BaseUrl
        {
            get => PubcrawlerUrl;
            set => PubcrawlerUrl = value;
        }

        public string Source { get; set; }

        [FieldDefinition(1, Type = FieldType.Number, Label = "Early Download Limit", Unit = "days", HelpText = "Time before release date Readarr will download from this indexer, empty is no limit", Advanced = true)]
        public int? EarlyReleaseLimit { get; set; }

        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult(Validator.Validate(this));
        }
    }
}
