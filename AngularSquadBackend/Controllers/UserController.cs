using System.ComponentModel.DataAnnotations;
using AngularSquadBackend.Data;
using AngularSquadBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngularSquadBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var users = await dbContext.Users
            .AsNoTracking()
            .Select(user => new UserResponse(user.Id, user.Username, user.FullName, user.Email, user.Role))
            .ToListAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FindAsync([id], cancellationToken);
        return user is null
            ? NotFound()
            : Ok(new UserResponse(user.Id, user.Username, user.FullName, user.Email, user.Role));
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(
        UserRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("A password is required when creating a user.");
        }

        var user = new User
        {
            Username = request.Username,
            FullName = request.FullName,
            Email = request.Email,
            Role = request.Role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new UserResponse(user.Id, user.Username, user.FullName, user.Email, user.Role);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UserRequest request,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FindAsync([id], cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        user.Username = request.Username;
        user.FullName = request.FullName;
        user.Email = request.Email;
        user.Role = request.Role;
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FindAsync([id], cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    public sealed record UserRequest(
        [Required, MaxLength(100)]
        string Username,
        [Required, MaxLength(150)]
        string FullName,
        [Required, EmailAddress, MaxLength(254)]
        string Email,
        [Required, MaxLength(60)]
        string Role,
        [MaxLength(128)]
        string? Password);

    public sealed record UserResponse(int Id, string? Username, string FullName, string Email, string Role);
}
