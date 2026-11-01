using System.Text.Json.Serialization;
using AngularSquadBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngularSquadBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MenuController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<MenuResponse>>> GetMenus(CancellationToken cancellationToken)
    {
        var menus = await dbContext.Menus
            .AsNoTracking()
            .Where(menu => menu.IsActive == 1)
            .OrderBy(menu => menu.Id)
            .Select(menu => new MenuResponse(
                menu.Id,
                menu.MenuName,
                menu.UrlMenu,
                menu.ParentId,
                menu.IsActive))
            .ToListAsync(cancellationToken);

        return Ok(menus);
    }

    public sealed record MenuResponse(
        [property: JsonPropertyName("id")] int Id,
        [property: JsonPropertyName("menu_name")] string MenuName,
        [property: JsonPropertyName("url_menu")] string UrlMenu,
        [property: JsonPropertyName("parent_id")] int ParentId,
        [property: JsonPropertyName("is_active")] int IsActive);
}
