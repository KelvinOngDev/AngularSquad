using System.Text.Json.Serialization;

namespace AngularSquadBackend.Dtos;

public sealed class MenuDto
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("menu_name")]
    public required string MenuName { get; init; }

    [JsonPropertyName("url_menu")]
    public required string UrlMenu { get; init; }

    [JsonPropertyName("parent_id")]
    public int ParentId { get; init; }

    [JsonPropertyName("children")]
    public List<MenuDto> Children { get; } = [];
}
