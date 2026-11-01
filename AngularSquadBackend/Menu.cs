using System.ComponentModel.DataAnnotations;

namespace AngularSquadBackend.Models;

public class Menu
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string MenuName { get; set; }

    [MaxLength(250)]
    public string UrlMenu { get; set; } = string.Empty;

    public int ParentId { get; set; }

    public int IsActive { get; set; }
}