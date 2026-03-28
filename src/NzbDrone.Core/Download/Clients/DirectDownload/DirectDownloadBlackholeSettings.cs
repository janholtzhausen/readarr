using System.ComponentModel;
using FluentValidation;
using Newtonsoft.Json;
using NzbDrone.Core.Annotations;
using NzbDrone.Core.ThingiProvider;
using NzbDrone.Core.Validation;
using NzbDrone.Core.Validation.Paths;

namespace NzbDrone.Core.Download.Clients.DirectDownload
{
    public class DirectDownloadBlackholeSettingsValidator : AbstractValidator<DirectDownloadBlackholeSettings>
    {
        public DirectDownloadBlackholeSettingsValidator()
        {
            RuleFor(c => c.DownloadFolder).IsValidPath();
            RuleFor(c => c.WatchFolder).IsValidPath();
        }
    }

    public class DirectDownloadBlackholeSettings : IProviderConfig
    {
        private static readonly DirectDownloadBlackholeSettingsValidator Validator = new ();

        [FieldDefinition(0, Label = "Download Folder", Type = FieldType.Path, HelpText = "Folder in which Readarr will store direct-download files")]
        public string DownloadFolder { get; set; }

        [FieldDefinition(1, Label = "Watch Folder", Type = FieldType.Path, HelpText = "Folder from which Readarr should import completed direct-download files")]
        public string WatchFolder { get; set; }

        [DefaultValue(false)]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
        [FieldDefinition(2, Label = "Read Only", Type = FieldType.Checkbox, HelpText = "Instead of moving files this will instruct Readarr to Copy or Hardlink (depending on settings/system configuration)")]
        public bool ReadOnly { get; set; }

        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult(Validator.Validate(this));
        }
    }
}
