using AngularSquadBackend.Data;
using AngularSquadBackend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngularSquadBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MenuController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MenuDto>>> GetMenus(CancellationToken cancellationToken)
    {
        var menus = await dbContext.Menus
            .AsNoTracking()
            .Where(menu => menu.IsActive == 1)
            .OrderBy(menu => menu.Id)
            .Select(menu => new MenuResponse(
                menu.Id,
                menu.MenuName,
                menu.UrlMenu,
                menu.ParentId))
            .ToListAsync(cancellationToken);

        var menusById = menus.ToDictionary(
            menu => menu.Id,
            menu => new MenuDto
            {
                Id = menu.Id,
                MenuName = menu.MenuName,
                UrlMenu = menu.UrlMenu,
                ParentId = menu.ParentId,
            });
        var rootMenus = new List<MenuDto>();

        foreach (var menu in menus)
        {
            var menuDto = menusById[menu.Id];
            if (menu.ParentId == 0)
            {
                rootMenus.Add(menuDto);
            }
            else if (menusById.TryGetValue(menu.ParentId, out var parent))
            {
                parent.Children.Add(menuDto);
            }
        }

        return Ok(rootMenus);
    }

    private sealed record MenuResponse(
        int Id,
        string MenuName,
        string UrlMenu,
        int ParentId);
}
