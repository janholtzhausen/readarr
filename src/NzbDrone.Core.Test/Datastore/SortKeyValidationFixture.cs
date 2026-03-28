using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Datastore
{
    [TestFixture]
    public class SortKeyValidationFixture : DbTest
    {
        [TestCase("amissingcolumn")]
        [TestCase("amissingtable.id")]
        [TestCase("table.table.column")]
        [TestCase("column; DROP TABLE Commands;--")]
        public void should_return_false_for_invalid_sort_key(string sortKey)
        {
            TableMapping.Mapper.IsValidSortKey(sortKey).Should().BeFalse();
        }

        [TestCase("author.sortName")]
        [TestCase("author.sortNameLastFirst")]
        [TestCase("authors.sortName")]
        [TestCase("authors.sortNameLastFirst")]
        [TestCase("Id")]
        [TestCase("id")]
        [TestCase("commands.id")]
        public void should_return_true_for_valid_sort_key(string sortKey)
        {
            TableMapping.Mapper.IsValidSortKey(sortKey).Should().BeTrue();
        }

        [TestCase("author.sortName", "AuthorMetadata", "SortName")]
        [TestCase("author.sortNameLastFirst", "AuthorMetadata", "SortNameLastFirst")]
        [TestCase("authors.sortName", "AuthorMetadata", "SortName")]
        [TestCase("authors.sortNameLastFirst", "AuthorMetadata", "SortNameLastFirst")]
        public void should_normalize_legacy_author_sort_aliases(string sortKey, string expectedTable, string expectedColumn)
        {
            var result = TableMapping.Mapper.GetSortKey(sortKey);

            result.Table.Should().Be(expectedTable);
            result.Column.Should().Be(expectedColumn);
        }
    }
}
