using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using AngularSquadBackend.Data;
using AngularSquadBackend.Dtos;
using AngularSquadBackend.Models;
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
            .Select(menu => new MenuDto
            {
                Id = menu.Id,
                MenuName = menu.MenuName,
                UrlMenu = menu.UrlMenu,
                ParentId = menu.ParentId,
                IsActive = menu.IsActive,
            })
            .ToListAsync(cancellationToken);

        return Ok(BuildMenuTree(menus));
    }

    [HttpGet("manage")]
    public async Task<ActionResult<IEnumerable<MenuDto>>> GetAllForManagement(
        CancellationToken cancellationToken)
    {
        var menus = await dbContext.Menus
            .AsNoTracking()
            .OrderBy(menu => menu.Id)
            .Select(menu => new MenuDto
            {
                Id = menu.Id,
                MenuName = menu.MenuName,
                UrlMenu = menu.UrlMenu,
                ParentId = menu.ParentId,
                IsActive = menu.IsActive,
            })
            .ToListAsync(cancellationToken);

        return Ok(menus);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MenuDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var menu = await dbContext.Menus
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new MenuDto
            {
                Id = item.Id,
                MenuName = item.MenuName,
                UrlMenu = item.UrlMenu,
                ParentId = item.ParentId,
                IsActive = item.IsActive,
            })
            .SingleOrDefaultAsync(cancellationToken);

        return menu is null ? NotFound() : Ok(menu);
    }

    [HttpPost]
    public async Task<ActionResult<MenuDto>> Create(
        MenuWriteDto request,
        CancellationToken cancellationToken)
    {
        if (request.ParentId != 0 &&
            !await dbContext.Menus.AnyAsync(menu => menu.Id == request.ParentId, cancellationToken))
        {
            return BadRequest("The selected parent menu does not exist.");
        }

        var menu = new Menu
        {
            MenuName = request.MenuName.Trim(),
            UrlMenu = request.UrlMenu.Trim(),
            ParentId = request.ParentId,
            IsActive = request.IsActive,
        };
        dbContext.Menus.Add(menu);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = ToDto(menu);
        return CreatedAtAction(nameof(GetById), new { id = menu.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        MenuWriteDto request,
        CancellationToken cancellationToken)
    {
        var menu = await dbContext.Menus.FindAsync([id], cancellationToken);
        if (menu is null)
        {
            return NotFound();
        }

        if (request.ParentId == id)
        {
            return BadRequest("A menu cannot be its own parent.");
        }

        if (request.ParentId != 0)
        {
            var parentExists = await dbContext.Menus
                .AnyAsync(item => item.Id == request.ParentId, cancellationToken);
            if (!parentExists)
            {
                return BadRequest("The selected parent menu does not exist.");
            }

            var ancestorId = request.ParentId;
            var visited = new HashSet<int>();
            while (ancestorId != 0 && visited.Add(ancestorId))
            {
                if (ancestorId == id)
                {
                    return BadRequest("A menu cannot be moved under one of its descendants.");
                }

                ancestorId = await dbContext.Menus
                    .Where(item => item.Id == ancestorId)
                    .Select(item => item.ParentId)
                    .SingleOrDefaultAsync(cancellationToken);
            }
        }

        menu.MenuName = request.MenuName.Trim();
        menu.UrlMenu = request.UrlMenu.Trim();
        menu.ParentId = request.ParentId;
        menu.IsActive = request.IsActive;
        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var menu = await dbContext.Menus.FindAsync([id], cancellationToken);
        if (menu is null)
        {
            return NotFound();
        }

        if (await dbContext.Menus.AnyAsync(item => item.ParentId == id, cancellationToken))
        {
            return Conflict("This menu still has child menus. Move or delete them first.");
        }

        if (await dbContext.PrivilegeUsers.AnyAsync(item => item.MenuId == id, cancellationToken))
        {
            return Conflict("This menu is assigned to user privileges and cannot be deleted.");
        }

        dbContext.Menus.Remove(menu);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("bulk-delete")]
    public async Task<IActionResult> BulkDelete(
        [FromBody] List<int>? ids,
        CancellationToken cancellationToken)
    {
        if (ids is null || ids.Count == 0)
        {
            return BadRequest("Select at least one menu to delete.");
        }

        if (ids.Any(id => id <= 0))
        {
            return BadRequest("Menu IDs must be positive integers.");
        }

        var uniqueIds = ids.Distinct().ToList();
        var hasUnselectedChildren = await dbContext.Menus
            .AnyAsync(menu => uniqueIds.Contains(menu.ParentId) && !uniqueIds.Contains(menu.Id), cancellationToken);
        if (hasUnselectedChildren)
        {
            return Conflict("One or more selected menus have child menus that were not selected.");
        }

        var hasPrivilegeAssignments = await dbContext.PrivilegeUsers
            .AnyAsync(privilege => uniqueIds.Contains(privilege.MenuId), cancellationToken);
        if (hasPrivilegeAssignments)
        {
            return Conflict("One or more selected menus are assigned to user privileges and cannot be deleted.");
        }

        var deletedCount = await dbContext.Menus
            .Where(menu => uniqueIds.Contains(menu.Id))
            .ExecuteDeleteAsync(cancellationToken);

        return Ok(new
        {
            message = $"{deletedCount} menu(s) deleted successfully.",
            deletedCount,
        });
    }

    private static List<MenuDto> BuildMenuTree(IReadOnlyCollection<MenuDto> menus)
    {
        var menusById = menus.ToDictionary(menu => menu.Id);
        var rootMenus = new List<MenuDto>();
        foreach (var menu in menus)
        {
            if (menu.ParentId == 0)
            {
                rootMenus.Add(menu);
            }
            else if (menusById.TryGetValue(menu.ParentId, out var parent))
            {
                parent.Children.Add(menu);
            }
        }

        return rootMenus;
    }

    private static MenuDto ToDto(Menu menu) => new()
    {
        Id = menu.Id,
        MenuName = menu.MenuName,
        UrlMenu = menu.UrlMenu,
        ParentId = menu.ParentId,
        IsActive = menu.IsActive,
    };

    public sealed class MenuWriteDto
    {
        [JsonPropertyName("menu_name"), Required, MaxLength(120)]
        public string MenuName { get; init; } = string.Empty;

        [JsonPropertyName("url_menu"), MaxLength(255)]
        public string UrlMenu { get; init; } = string.Empty;

        [JsonPropertyName("parent_id"), Range(0, int.MaxValue)]
        public int ParentId { get; init; }

        [JsonPropertyName("is_active"), Range(0, 1)]
        public int IsActive { get; init; }
    }
}
