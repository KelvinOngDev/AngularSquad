using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AngularSquadBackend.Models;

public class User
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string? Username { get; set; }

    [Required, MaxLength(120)]
    public required string FullName { get; set; }

    [Required, EmailAddress, MaxLength(190)]
    public required string Email { get; set; }

    [Required, MaxLength(60)]
    public required string Role { get; set; }

    [MaxLength(255)]
    [JsonIgnore]
    public string? PasswordHash { get; set; }
}