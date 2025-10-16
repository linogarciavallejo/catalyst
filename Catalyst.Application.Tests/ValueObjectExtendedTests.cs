using Catalyst.Domain.ValueObjects;
using FluentAssertions;
using MongoDB.Bson;

namespace Catalyst.Application.Tests.ValueObjects;

/// <summary>
/// Tests for IdeaTitle value object
/// </summary>
public class IdeaTitleValueObjectTests
{
    [Fact]
    public void Create_WithValidTitle_ReturnsTitle()
    {
        // Arrange
        var title = "Great Innovation Idea";

        // Act
        var ideaTitle = IdeaTitle.Create(title);

        // Assert
        ideaTitle.Value.Should().Be(title);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Create_WithEmptyOrWhitespace_ThrowsException(string? title)
    {
        // Act
        var action = () => IdeaTitle.Create(title ?? "");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Create_WithTrimming_RemovesWhitespace()
    {
        // Arrange
        var title = "  Perfect Idea  ";

        // Act
        var ideaTitle = IdeaTitle.Create(title);

        // Assert
        ideaTitle.Value.Should().Be("Perfect Idea");
    }

    [Fact]
    public void Create_WithMinimumLength_Succeeds()
    {
        // Arrange
        var title = "A";

        // Act
        var ideaTitle = IdeaTitle.Create(title);

        // Assert
        ideaTitle.Value.Should().Be("A");
    }

    [Fact]
    public void Create_WithMaximumLength_Succeeds()
    {
        // Arrange
        var title = new string('X', IdeaTitle.MaxLength);

        // Act
        var ideaTitle = IdeaTitle.Create(title);

        // Assert
        ideaTitle.Value.Should().HaveLength(IdeaTitle.MaxLength);
    }

    [Fact]
    public void Create_ExceedingMaxLength_ThrowsException()
    {
        // Arrange
        var title = new string('X', IdeaTitle.MaxLength + 1);

        // Act
        var action = () => IdeaTitle.Create(title);

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Equality_WithSameTitle_ReturnsTrue()
    {
        // Arrange
        var title1 = IdeaTitle.Create("Test Title");
        var title2 = IdeaTitle.Create("Test Title");

        // Act & Assert
        title1.Should().Be(title2);
    }

    [Fact]
    public void Equality_WithDifferentTitles_ReturnsFalse()
    {
        // Arrange
        var title1 = IdeaTitle.Create("Title One");
        var title2 = IdeaTitle.Create("Title Two");

        // Act & Assert
        title1.Should().NotBe(title2);
    }

    [Fact]
    public void ToString_ReturnsValue()
    {
        // Arrange
        var title = IdeaTitle.Create("Test Title");

        // Act
        var str = title.ToString();

        // Assert
        str.Should().Be("Test Title");
    }
}

/// <summary>
/// Tests for IdeaDescription value object
/// </summary>
public class IdeaDescriptionValueObjectTests
{
    [Fact]
    public void Create_WithValidDescription_ReturnsDescription()
    {
        // Arrange
        var description = "This is a comprehensive description of an innovative idea";

        // Act
        var ideaDescription = IdeaDescription.Create(description);

        // Assert
        ideaDescription.Value.Should().Be(description);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Create_WithEmptyOrWhitespace_ThrowsException(string? description)
    {
        // Act
        var action = () => IdeaDescription.Create(description ?? "");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Create_WithTrimming_RemovesWhitespace()
    {
        // Arrange
        var description = "  Perfect Description  ";

        // Act
        var ideaDescription = IdeaDescription.Create(description);

        // Assert
        ideaDescription.Value.Should().Be("Perfect Description");
    }

    [Fact]
    public void Create_WithMinimumLength_Succeeds()
    {
        // Arrange
        var description = "X";

        // Act
        var ideaDescription = IdeaDescription.Create(description);

        // Assert
        ideaDescription.Value.Should().Be("X");
    }

    [Fact]
    public void Create_WithMaximumLength_Succeeds()
    {
        // Arrange
        var description = new string('X', IdeaDescription.MaxLength);

        // Act
        var ideaDescription = IdeaDescription.Create(description);

        // Assert
        ideaDescription.Value.Should().HaveLength(IdeaDescription.MaxLength);
    }

    [Fact]
    public void Create_ExceedingMaxLength_ThrowsException()
    {
        // Arrange
        var description = new string('X', IdeaDescription.MaxLength + 1);

        // Act
        var action = () => IdeaDescription.Create(description);

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Equality_WithSameDescription_ReturnsTrue()
    {
        // Arrange
        var desc1 = IdeaDescription.Create("Test Description");
        var desc2 = IdeaDescription.Create("Test Description");

        // Act & Assert
        desc1.Should().Be(desc2);
    }

    [Fact]
    public void ToString_ReturnsValue()
    {
        // Arrange
        var description = IdeaDescription.Create("Test Description");

        // Act
        var str = description.ToString();

        // Assert
        str.Should().Be("Test Description");
    }
}

/// <summary>
/// Tests for Category value object
/// </summary>
public class CategoryValueObjectTests
{
    [Theory]
    [InlineData("technology")]
    [InlineData("process")]
    [InlineData("innovation")]
    [InlineData("efficiency")]
    [InlineData("culture")]
    public void Create_WithValidCategory_Succeeds(string categoryName)
    {
        // Act
        var category = Category.Create(categoryName);

        // Assert
        category.Should().NotBeNull();
    }

    [Fact]
    public void Create_WithCaseInsensitive_Normalizes()
    {
        // Arrange
        var lowerCase = Category.Create("technology");
        var upperCase = Category.Create("TECHNOLOGY");
        var mixedCase = Category.Create("TeChnOlogy");

        // Act & Assert
        lowerCase.Should().Be(upperCase);
        lowerCase.Should().Be(mixedCase);
    }

    [Fact]
    public void Create_WithInvalidCategory_ThrowsException()
    {
        // Act
        var action = () => Category.Create("InvalidCategory");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Create_WithEmptyOrWhitespace_ThrowsException(string? category)
    {
        // Act
        var action = () => Category.Create(category ?? "");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Technology_StaticProperty_EqualsCreated()
    {
        // Act
        var technology = Category.Create("technology");

        // Assert
        technology.Should().Be(Category.Technology);
    }

    [Fact]
    public void Process_StaticProperty_EqualsCreated()
    {
        // Act
        var process = Category.Create("process");

        // Assert
        process.Should().Be(Category.Process);
    }

    [Fact]
    public void Innovation_StaticProperty_EqualsCreated()
    {
        // Act
        var innovation = Category.Create("innovation");

        // Assert
        innovation.Should().Be(Category.Innovation);
    }

    [Fact]
    public void Efficiency_StaticProperty_EqualsCreated()
    {
        // Act
        var efficiency = Category.Create("efficiency");

        // Assert
        efficiency.Should().Be(Category.Efficiency);
    }

    [Fact]
    public void Culture_StaticProperty_EqualsCreated()
    {
        // Act
        var culture = Category.Create("culture");

        // Assert
        culture.Should().Be(Category.Culture);
    }

    [Fact]
    public void GetAll_ReturnsAllCategories()
    {
        // Act
        var allCategories = Category.GetAll();

        // Assert
        allCategories.Should().HaveCount(5);
        allCategories.Should().Contain(Category.Technology);
        allCategories.Should().Contain(Category.Process);
        allCategories.Should().Contain(Category.Innovation);
        allCategories.Should().Contain(Category.Efficiency);
        allCategories.Should().Contain(Category.Culture);
    }
}

/// <summary>
/// Tests for Tags value object
/// </summary>
public class TagsValueObjectTests
{
    [Fact]
    public void Create_WithValidTags_ReturnsTags()
    {
        // Arrange
        var tags = new[] { "tag1", "tag2", "tag3" };

        // Act
        var tagsList = Tags.Create(tags);

        // Assert
        tagsList.Value.Should().HaveCount(3);
    }

    [Fact]
    public void Create_WithSingleTag_Succeeds()
    {
        // Arrange
        var tags = new[] { "singletag" };

        // Act
        var tagsList = Tags.Create(tags);

        // Assert
        tagsList.Value.Should().HaveCount(1);
        tagsList.Value.Should().Contain("singletag");
    }

    [Fact]
    public void Create_WithMaximumTags_Succeeds()
    {
        // Arrange
        var tags = Enumerable.Range(1, Tags.MaxTags).Select(i => $"tag{i}").ToList();

        // Act
        var tagsList = Tags.Create(tags);

        // Assert
        tagsList.Value.Should().HaveCount(Tags.MaxTags);
    }

    [Fact]
    public void Create_ExceedingMaximumTags_ThrowsException()
    {
        // Arrange
        var tags = Enumerable.Range(1, Tags.MaxTags + 1).Select(i => $"tag{i}").ToList();

        // Act
        var action = () => Tags.Create(tags);

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Create_WithEmptyTagsList_ThrowsException()
    {
        // Arrange
        var tags = Array.Empty<string>();

        // Act
        var action = () => Tags.Create(tags);

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Create_WithNullTagsList_ThrowsException()
    {
        // Act
        var action = () => Tags.Create(null!);

        // Assert
        action.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void Create_WithDuplicates_Deduplicates()
    {
        // Arrange
        var tags = new[] { "tag1", "tag2", "tag1", "tag2", "tag3" };

        // Act
        var tagsList = Tags.Create(tags);

        // Assert
        tagsList.Value.Should().HaveCount(3);
        tagsList.Value.Should().Contain("tag1");
        tagsList.Value.Should().Contain("tag2");
        tagsList.Value.Should().Contain("tag3");
    }

    [Fact]
    public void Create_WithWhitespaceInTags_Trims()
    {
        // Arrange
        var tags = new[] { "  tag1  ", "  tag2  " };

        // Act
        var tagsList = Tags.Create(tags);

        // Assert
        tagsList.Value.Should().Contain("tag1");
        tagsList.Value.Should().Contain("tag2");
    }

    [Fact]
    public void Create_Normalizes_ToLowercase()
    {
        // Arrange
        var tags = new[] { "TAG1", "Tag2", "tAg3" };

        // Act
        var tagsList = Tags.Create(tags);

        // Assert
        tagsList.Value.Should().Contain("tag1");
        tagsList.Value.Should().Contain("tag2");
        tagsList.Value.Should().Contain("tag3");
    }

    [Fact]
    public void Create_WithTagExceedingMaxLength_ThrowsException()
    {
        // Arrange
        var longTag = new string('X', Tags.MaxTagLength + 1);
        var tags = new[] { longTag };

        // Act
        var action = () => Tags.Create(tags);

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Create_WithEmptyStringTag_IgnoresIt()
    {
        // Arrange
        var tags = new[] { "tag1", "", "tag2" };

        // Act
        var tagsList = Tags.Create(tags);

        // Assert
        tagsList.Value.Should().HaveCount(2);
        tagsList.Value.Should().Contain("tag1");
        tagsList.Value.Should().Contain("tag2");
    }

    [Fact]
    public void Create_WithSameTags_HasSameContent()
    {
        // Arrange
        var tags1 = Tags.Create(new[] { "tag1", "tag2" });
        var tags2 = Tags.Create(new[] { "tag1", "tag2" });

        // Act & Assert
        tags1.Value.Should().Equal(tags2.Value);
    }

    [Fact]
    public void ToString_ReturnsCommaSeparatedTags()
    {
        // Arrange
        var tags = Tags.Create(new[] { "tag1", "tag2", "tag3" });

        // Act
        var str = tags.ToString();

        // Assert
        str.Should().Contain("tag1");
        str.Should().Contain("tag2");
        str.Should().Contain("tag3");
        str.Should().Contain(",");
    }
}

/// <summary>
/// Tests for IdeaId value object
/// </summary>
public class IdeaIdValueObjectTests
{
    [Fact]
    public void Create_WithValidId_ReturnsIdeaId()
    {
        // Arrange
        var validId = ObjectId.GenerateNewId().ToString();

        // Act
        var ideaId = IdeaId.Create(validId);

        // Assert
        ideaId.Value.Should().Be(validId);
    }

    [Fact]
    public void Create_WithNullOrEmpty_ThrowsException()
    {
        // Act
        var action = () => IdeaId.Create("");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Equality_WithSameId_ReturnsTrue()
    {
        // Arrange
        var id = ObjectId.GenerateNewId().ToString();
        var ideaId1 = IdeaId.Create(id);
        var ideaId2 = IdeaId.Create(id);

        // Act & Assert
        ideaId1.Should().Be(ideaId2);
    }

    [Fact]
    public void Equality_WithDifferentIds_ReturnsFalse()
    {
        // Arrange
        var ideaId1 = IdeaId.Create(ObjectId.GenerateNewId().ToString());
        var ideaId2 = IdeaId.Create(ObjectId.GenerateNewId().ToString());

        // Act & Assert
        ideaId1.Should().NotBe(ideaId2);
    }
}

/// <summary>
/// Tests for CommentId value object
/// </summary>
public class CommentIdValueObjectTests
{
    [Fact]
    public void Create_WithValidId_ReturnsCommentId()
    {
        // Arrange
        var validId = ObjectId.GenerateNewId().ToString();

        // Act
        var commentId = CommentId.Create(validId);

        // Assert
        commentId.Value.Should().Be(validId);
    }

    [Fact]
    public void Create_WithNullOrEmpty_ThrowsException()
    {
        // Act
        var action = () => CommentId.Create("");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Equality_WithSameId_ReturnsTrue()
    {
        // Arrange
        var id = ObjectId.GenerateNewId().ToString();
        var commentId1 = CommentId.Create(id);
        var commentId2 = CommentId.Create(id);

        // Act & Assert
        commentId1.Should().Be(commentId2);
    }
}
