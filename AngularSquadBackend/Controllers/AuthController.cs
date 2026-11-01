using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.ComponentModel.DataAnnotations;
using AngularSquadBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AngularSquadBackend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    AppDbContext dbContext,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item => item.Username == request.Username,
                cancellationToken);

        if (user?.Username is null
            || string.IsNullOrEmpty(user.PasswordHash)
            || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Username atau password salah." });
        }

        var issuer = configuration["Jwt:Issuer"] ?? "AngularSquadBackend";
        var audience = configuration["Jwt:Audience"] ?? "AngularSquadFrontend";
        var signingKey = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT signing key is not configured.");
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: credentials);
        var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new LoginResponse(
            tokenValue,
            new AuthenticatedUser(user.Id, user.Username, user.FullName, user.Role)));
    }

    public sealed record LoginRequest(
        [Required, MaxLength(100)] string Username,
        [Required, MaxLength(128)] string Password);

    public sealed record LoginResponse(string Token, AuthenticatedUser User);

    public sealed record AuthenticatedUser(int Id, string Username, string FullName, string Role);
}
