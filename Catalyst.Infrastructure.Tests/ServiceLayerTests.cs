using System;
using System.Collections.Generic;
using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;
using Catalyst.Infrastructure.Services;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace Catalyst.Infrastructure.Tests.Services;

/// <summary>
/// Tests for IdeaService business logic
/// </summary>
public class IdeaServiceTests
{
    private readonly IIdeaRepository _ideaRepository;
    private readonly IGamificationService _gamificationService;
    private readonly IdeaService _ideaService;

    private static Idea CreateIdea()
        => Idea.Create(
            IdeaTitle.Create("Test Idea"),
            IdeaDescription.Create("Test Description"),
            Category.Technology,
            Tags.Create(new[] { "test" }),
            UserId.Create("507f1f77bcf86cd799439011"),
            "Test User");

    private static Idea CreateIdeaWithTitle(string title)
    {
        var idea = CreateIdea();
        idea.Title = IdeaTitle.Create(title);
        return idea;
    }

    private static string NewId() => Guid.NewGuid().ToString("N");

    public IdeaServiceTests()
    {
        _ideaRepository = Substitute.For<IIdeaRepository>();
        _gamificationService = Substitute.For<IGamificationService>();
        _ideaService = new IdeaService(_ideaRepository, _gamificationService);
    }

    [Fact]
    public async Task CreateIdeaAsync_WithValidIdea_SavesAndAwardsPoints()
    {
        // Arrange
        var idea = CreateIdea();

        _ideaRepository.AddAsync(idea).Returns(idea);
        _gamificationService.AwardPointsAsync("507f1f77bcf86cd799439011", 50).Returns(50);

        // Act
        var result = await _ideaService.CreateIdeaAsync(idea);

        // Assert
        result.Should().NotBeNull();
        await _ideaRepository.Received(1).AddAsync(idea);
        await _gamificationService.Received(1).AwardPointsAsync("507f1f77bcf86cd799439011", 50);
    }

    [Fact]
    public async Task CreateIdeaAsync_WithNullTitle_ThrowsException()
    {
        // Arrange
        var idea = CreateIdea();
        idea.Title = null!;

        // Act
        var action = () => _ideaService.CreateIdeaAsync(idea);

        // Assert
        await action.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task CreateIdeaAsync_WithNullDescription_ThrowsException()
    {
        // Arrange
        var idea = CreateIdea();
        idea.Description = null!;

        // Act
        var action = () => _ideaService.CreateIdeaAsync(idea);

        // Assert
        await action.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task GetIdeaByIdAsync_WithValidId_ReturnsIdea()
    {
        // Arrange
        var ideaId = NewId();
        var idea = CreateIdea();
        idea.AssignId(IdeaId.Create(ideaId));
        idea.Title = IdeaTitle.Create("Test Idea");

        _ideaRepository.GetByIdAsync(ideaId).Returns(idea);

        // Act
        var result = await _ideaService.GetIdeaByIdAsync(ideaId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Value.Should().Be(ideaId);
        await _ideaRepository.Received(1).GetByIdAsync(ideaId);
    }

    [Fact]
    public async Task GetIdeaByIdAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        var ideaId = NewId();
        _ideaRepository.GetByIdAsync(ideaId).ReturnsNull();

        // Act
        var result = await _ideaService.GetIdeaByIdAsync(ideaId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task SearchIdeasAsync_WithSearchTerm_CallsRepository()
    {
        // Arrange
        var searchTerm = "innovation";
        var ideas = new List<Idea>
        {
            CreateIdeaWithTitle("Innovation Idea")
        };

        _ideaRepository.SearchByTitleAsync(searchTerm).Returns(ideas);

        // Act
        var result = await _ideaService.SearchIdeasAsync(searchTerm);

        // Assert
        result.Should().HaveCount(1);
        await _ideaRepository.Received(1).SearchByTitleAsync(searchTerm);
    }

    [Fact]
    public async Task SearchIdeasAsync_WithEmptySearchTerm_ReturnsAllIdeas()
    {
        // Arrange
        var ideas = new List<Idea>
        {
            CreateIdeaWithTitle("Idea 1"),
            CreateIdeaWithTitle("Idea 2")
        };

        _ideaRepository.GetAllAsync().Returns(ideas);

        // Act
        var result = await _ideaService.SearchIdeasAsync("");

        // Assert
        result.Should().HaveCount(2);
        await _ideaRepository.Received(1).GetAllAsync();
    }

    [Fact]
    public async Task GetIdeasByCategoryAsync_WithValidCategory_ReturnsIdeas()
    {
        // Arrange
        var category = "Technology";
        var ideas = new List<Idea>
        {
            CreateIdeaWithTitle("Tech Idea")
        };
        ideas[0].Category = Category.Technology;

        _ideaRepository.GetByCategoryAsync(category).Returns(ideas);

        // Act
        var result = await _ideaService.GetIdeasByCategoryAsync(category);

        // Assert
        result.Should().HaveCount(1);
        await _ideaRepository.Received(1).GetByCategoryAsync(category);
    }

    [Fact]
    public async Task UpdateIdeaAsync_WithValidIdea_CallsRepository()
    {
        // Arrange
        var idea = CreateIdeaWithTitle("Updated Idea");
        _ideaRepository.UpdateAsync(idea).Returns(idea);

        // Act
        var result = await _ideaService.UpdateIdeaAsync(idea);

        // Assert
        result.Should().NotBeNull();
        await _ideaRepository.Received(1).UpdateAsync(idea);
    }

    [Fact]
    public async Task DeleteIdeaAsync_WithExistingIdea_DeductsPointsAndDeletes()
    {
        // Arrange
        var ideaId = NewId();
        var creatorId = "507f1f77bcf86cd799439011";
        var idea = CreateIdea();
        idea.AssignId(IdeaId.Create(ideaId));
        idea.CreatedBy = UserId.Create(creatorId);

        _ideaRepository.GetByIdAsync(ideaId).Returns(idea);
        _ideaRepository.DeleteAsync(ideaId).Returns(true);
        _gamificationService.DeductPointsAsync(creatorId, 50).Returns(0);

        // Act
        var result = await _ideaService.DeleteIdeaAsync(ideaId);

        // Assert
        result.Should().BeTrue();
        await _ideaRepository.Received(1).DeleteAsync(ideaId);
        await _gamificationService.Received(1).DeductPointsAsync(creatorId, 50);
    }

    [Fact]
    public async Task DeleteIdeaAsync_WithNonexistentIdea_ReturnsFalse()
    {
        // Arrange
        var ideaId = NewId();
        _ideaRepository.GetByIdAsync(ideaId).ReturnsNull();

        // Act
        var result = await _ideaService.DeleteIdeaAsync(ideaId);

        // Assert
        result.Should().BeFalse();
        await _ideaRepository.DidNotReceive().DeleteAsync(ideaId);
        await _gamificationService.DidNotReceive().DeductPointsAsync(Arg.Any<string>(), Arg.Any<int>());
    }

    [Fact]
    public async Task GetTopIdeasAsync_WithDefaultLimit_CallsRepositoryWithLimit()
    {
        // Arrange
        var ideas = new List<Idea>
        {
            CreateIdeaWithTitle("Top Idea 1"),
            CreateIdeaWithTitle("Top Idea 2")
        };

        _ideaRepository.GetTopIdeasByVotesAsync(10).Returns(ideas);

        // Act
        var result = await _ideaService.GetTopIdeasAsync();

        // Assert
        result.Should().HaveCount(2);
        await _ideaRepository.Received(1).GetTopIdeasByVotesAsync(10);
    }

    [Fact]
    public async Task GetTopIdeasAsync_WithCustomLimit_CallsRepositoryWithCustomLimit()
    {
        // Arrange
        var ideas = new List<Idea> { CreateIdeaWithTitle("Top Idea") };
        _ideaRepository.GetTopIdeasByVotesAsync(5).Returns(ideas);

        // Act
        var result = await _ideaService.GetTopIdeasAsync(5);

        // Assert
        result.Should().HaveCount(1);
        await _ideaRepository.Received(1).GetTopIdeasByVotesAsync(5);
    }
}

/// <summary>
/// Tests for VotingService business logic
/// </summary>
public class VotingServiceTests
{
    private readonly IVoteRepository _voteRepository;
    private readonly IIdeaRepository _ideaRepository;
    private readonly VotingService _votingService;

    private static Idea CreateIdea()
        => Idea.Create(
            IdeaTitle.Create("Vote Idea"),
            IdeaDescription.Create("Description"),
            Category.Technology,
            Tags.Create(new[] { "tag" }),
            UserId.Create("507f1f77bcf86cd799439022"),
            "Voter");

    private static Vote CreateVote(string ideaId, string userId, VoteType type)
        => Vote.Create(
            IdeaId.Create(ideaId),
            UserId.Create(userId),
            type);

    public VotingServiceTests()
    {
        _voteRepository = Substitute.For<IVoteRepository>();
        _ideaRepository = Substitute.For<IIdeaRepository>();
        _votingService = new VotingService(_voteRepository, _ideaRepository);
    }

    [Fact]
    public async Task VoteAsync_WithNewUpvote_CreatesVote()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var ideaId = NewId();
        var vote = CreateVote(ideaId, userId, VoteType.Upvote);

        _voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId).ReturnsNull();
        _voteRepository.AddAsync(Arg.Any<Vote>()).Returns(vote);
        _voteRepository.GetUpvoteCountAsync(ideaId).Returns(1);
        _voteRepository.GetDownvoteCountAsync(ideaId).Returns(0);

        var idea = CreateIdea();
        idea.Upvotes = 0;
        idea.Downvotes = 0;
        _ideaRepository.GetByIdAsync(ideaId).Returns(idea);
        _ideaRepository.UpdateAsync(Arg.Any<Idea>()).Returns(idea);

        // Act
        var result = await _votingService.VoteAsync(userId, ideaId, true);

        // Assert
        result.Should().NotBeNull();
        result.VoteType.Should().Be(VoteType.Upvote);
        await _voteRepository.Received(1).AddAsync(Arg.Any<Vote>());
    }

    [Fact]
    public async Task VoteAsync_WithDownvote_CreatesDownvote()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var ideaId = NewId();
        var vote = CreateVote(ideaId, userId, VoteType.Downvote);

        _voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId).ReturnsNull();
        _voteRepository.AddAsync(Arg.Any<Vote>()).Returns(vote);
        _voteRepository.GetUpvoteCountAsync(ideaId).Returns(0);
        _voteRepository.GetDownvoteCountAsync(ideaId).Returns(1);

        var idea = CreateIdea();
        _ideaRepository.GetByIdAsync(ideaId).Returns(idea);
        _ideaRepository.UpdateAsync(Arg.Any<Idea>()).Returns(idea);

        // Act
        var result = await _votingService.VoteAsync(userId, ideaId, false);

        // Assert
        result.VoteType.Should().Be(VoteType.Downvote);
    }

    [Fact]
    public async Task VoteAsync_WithExistingVote_RemovesOldAndCreatesNew()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var ideaId = NewId();
        var oldVote = CreateVote(ideaId, userId, VoteType.Downvote);
        oldVote.AssignId("oldVoteId");
        var newVote = CreateVote(ideaId, userId, VoteType.Upvote);

        _voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId).Returns(oldVote);
        _voteRepository.DeleteAsync("oldVoteId").Returns(true);
        _voteRepository.AddAsync(Arg.Any<Vote>()).Returns(newVote);
        _voteRepository.GetUpvoteCountAsync(ideaId).Returns(1);
        _voteRepository.GetDownvoteCountAsync(ideaId).Returns(0);

        var idea = CreateIdea();
        idea.Upvotes = 0;
        idea.Downvotes = 1;
        _ideaRepository.GetByIdAsync(ideaId).Returns(idea);
        _ideaRepository.UpdateAsync(Arg.Any<Idea>()).Returns(idea);

        // Act
        var result = await _votingService.VoteAsync(userId, ideaId, true);

        // Assert
        result.VoteType.Should().Be(VoteType.Upvote);
        await _voteRepository.Received(1).DeleteAsync("oldVoteId");
    }

    [Fact]
    public async Task RemoveVoteAsync_WithExistingVote_RemovesAndUpdatesIdea()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var ideaId = NewId();
        var vote = CreateVote(ideaId, userId, VoteType.Upvote);
        vote.AssignId("voteId");

        _voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId).Returns(vote);
        _voteRepository.DeleteAsync("voteId").Returns(true);
        _voteRepository.GetUpvoteCountAsync(ideaId).Returns(0);
        _voteRepository.GetDownvoteCountAsync(ideaId).Returns(0);

        var idea = CreateIdea();
        idea.Upvotes = 1;
        idea.Downvotes = 0;
        _ideaRepository.GetByIdAsync(ideaId).Returns(idea);
        _ideaRepository.UpdateAsync(Arg.Any<Idea>()).Returns(idea);

        // Act
        var result = await _votingService.RemoveVoteAsync(userId, ideaId);

        // Assert
        result.Should().BeTrue();
        await _voteRepository.Received(1).DeleteAsync("voteId");
        await _ideaRepository.Received(1).UpdateAsync(Arg.Any<Idea>());
    }

    [Fact]
    public async Task RemoveVoteAsync_WithNonexistentVote_ReturnsFalse()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var ideaId = NewId();

        _voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId).ReturnsNull();

        // Act
        var result = await _votingService.RemoveVoteAsync(userId, ideaId);

        // Assert
        result.Should().BeFalse();
        await _voteRepository.DidNotReceive().DeleteAsync(Arg.Any<string>());
    }

    [Fact]
    public async Task GetUpvoteCountAsync_ReturnsCount()
    {
        // Arrange
        var ideaId = NewId();
        _voteRepository.GetUpvoteCountAsync(ideaId).Returns(5);

        // Act
        var result = await _votingService.GetUpvoteCountAsync(ideaId);

        // Assert
        result.Should().Be(5);
    }

    [Fact]
    public async Task GetDownvoteCountAsync_ReturnsCount()
    {
        // Arrange
        var ideaId = NewId();
        _voteRepository.GetDownvoteCountAsync(ideaId).Returns(2);

        // Act
        var result = await _votingService.GetDownvoteCountAsync(ideaId);

        // Assert
        result.Should().Be(2);
    }
}

/// <summary>
/// Tests for GamificationService business logic
/// </summary>
public class GamificationServiceTests
{
    private readonly IUserRepository _userRepository;
    private readonly GamificationService _gamificationService;

    public GamificationServiceTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _gamificationService = new GamificationService(_userRepository);
    }

    [Fact]
    public async Task AwardPointsAsync_WithValidUser_IncrementsPoints()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var user = User.Create(
            Email.Create("user@example.com"),
            "Test User",
            "hash",
            "Test",
            UserRole.Contributor);
        user.AssignId(UserId.Create(userId));
        user.EipPoints = EipPoints.Create(100);

        _userRepository.GetByIdAsync(userId).Returns(user);
        _userRepository.UpdateAsync(Arg.Any<User>()).Returns(user);

        // Act
        var result = await _gamificationService.AwardPointsAsync(userId, 50);

        // Assert
        result.Should().Be(150);
        await _userRepository.Received(1).UpdateAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task AwardPointsAsync_WithNonexistentUser_ThrowsException()
    {
        // Arrange
        var userId = "nonexistent";
        _userRepository.GetByIdAsync(userId).ReturnsNull();

        // Act
        var action = () => _gamificationService.AwardPointsAsync(userId, 50);

        // Assert
        await action.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task AwardPointsAsync_UpdatesTimestamp()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var beforeTime = DateTime.UtcNow;
        var user = User.Create(
            Email.Create("user@example.com"),
            "Test User",
            "hash",
            "Test",
            UserRole.Contributor);
        user.AssignId(UserId.Create(userId));
        user.EipPoints = EipPoints.Create(100);
        user.UpdatedAt = beforeTime;

        _userRepository.GetByIdAsync(userId).Returns(user);
        User? capturedUser = null;
        _userRepository.UpdateAsync(Arg.Do<User>(u => capturedUser = u)).Returns(user);

        // Act
        await _gamificationService.AwardPointsAsync(userId, 50);

        // Assert
        capturedUser!.UpdatedAt.Should().BeOnOrAfter(beforeTime);
    }

    [Fact]
    public async Task DeductPointsAsync_WithValidUser_DecrementsPoints()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var user = User.Create(
            Email.Create("user@example.com"),
            "Test User",
            "hash",
            "Test",
            UserRole.Contributor);
        user.AssignId(UserId.Create(userId));
        user.EipPoints = EipPoints.Create(100);

        _userRepository.GetByIdAsync(userId).Returns(user);
        _userRepository.UpdateAsync(Arg.Any<User>()).Returns(user);

        // Act
        var result = await _gamificationService.DeductPointsAsync(userId, 30);

        // Assert
        result.Should().Be(70);
        await _userRepository.Received(1).UpdateAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task DeductPointsAsync_WithMorePointsThanBalance_ReturnsZero()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var user = User.Create(
            Email.Create("user@example.com"),
            "Test User",
            "hash",
            "Test",
            UserRole.Contributor);
        user.AssignId(UserId.Create(userId));
        user.EipPoints = EipPoints.Create(50);

        _userRepository.GetByIdAsync(userId).Returns(user);
        _userRepository.UpdateAsync(Arg.Any<User>()).Returns(user);

        // Act
        var result = await _gamificationService.DeductPointsAsync(userId, 100);

        // Assert
        result.Should().Be(0); // Cannot go below 0
    }

    [Fact]
    public async Task DeductPointsAsync_WithNonexistentUser_ThrowsException()
    {
        // Arrange
        var userId = "nonexistent";
        _userRepository.GetByIdAsync(userId).ReturnsNull();

        // Act
        var action = () => _gamificationService.DeductPointsAsync(userId, 30);

        // Assert
        await action.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task GetUserPointsAsync_WithValidUser_ReturnsPoints()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var user = User.Create(
            Email.Create("user@example.com"),
            "Test User",
            "hash",
            "Test",
            UserRole.Contributor);
        user.AssignId(UserId.Create(userId));
        user.EipPoints = EipPoints.Create(250);

        _userRepository.GetByIdAsync(userId).Returns(user);

        // Act
        var result = await _gamificationService.GetUserPointsAsync(userId);

        // Assert
        result.Should().Be(250);
    }

    [Fact]
    public async Task GetUserPointsAsync_WithNonexistentUser_ThrowsException()
    {
        // Arrange
        var userId = "nonexistent";
        _userRepository.GetByIdAsync(userId).ReturnsNull();

        // Act
        var action = () => _gamificationService.GetUserPointsAsync(userId);

        // Assert
        await action.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task GetLeaderboardAsync_WithDefaultLimit_CallsRepositoryWithLimit()
    {
        // Arrange
        var users = new List<User>
        {
            new() { Id = UserId.Create("user1"), EipPoints = EipPoints.Create(500) },
            new() { Id = UserId.Create("user2"), EipPoints = EipPoints.Create(450) }
        };

        _userRepository.GetTopUsersByPointsAsync(10).Returns(users);

        // Act
        var result = await _gamificationService.GetLeaderboardAsync();

        // Assert
        result.Should().HaveCount(2);
        await _userRepository.Received(1).GetTopUsersByPointsAsync(10);
    }

    [Fact]
    public async Task GetLeaderboardAsync_WithCustomLimit_CallsRepositoryWithCustomLimit()
    {
        // Arrange
        var users = new List<User>
        {
            new() { Id = UserId.Create("user1"), EipPoints = EipPoints.Create(500) }
        };

        _userRepository.GetTopUsersByPointsAsync(5).Returns(users);

        // Act
        var result = await _gamificationService.GetLeaderboardAsync(5);

        // Assert
        result.Should().HaveCount(1);
        await _userRepository.Received(1).GetTopUsersByPointsAsync(5);
    }

    [Fact]
    public async Task GetLeaderboardAsync_ReturnsOrderedByPoints()
    {
        // Arrange
        var users = new List<User>
        {
            new() { EipPoints = EipPoints.Create(500) },
            new() { EipPoints = EipPoints.Create(450) },
            new() { EipPoints = EipPoints.Create(300) }
        };

        _userRepository.GetTopUsersByPointsAsync(10).Returns(users);

        // Act
        var result = await _gamificationService.GetLeaderboardAsync();

        // Assert
        result.Should().HaveCount(3);
        var resultList = result.ToList();
        resultList[0].EipPoints.Value.Should().Be(500);
        resultList[1].EipPoints.Value.Should().Be(450);
        resultList[2].EipPoints.Value.Should().Be(300);
    }
}
