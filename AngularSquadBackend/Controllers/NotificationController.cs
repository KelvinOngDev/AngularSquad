using AngularSquadBackend.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace AngularSquadBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController(IHubContext<NotificationHub> hubContext) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] NotificationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Pesan tidak boleh kosong." });
        }

        await hubContext.Clients.All.SendAsync("ReceiveNotification", request.Message);

        return Ok(new
        {
            status = "Notifikasi berhasil dikirim",
            message = request.Message,
        });
    }
}

public sealed class NotificationRequest
{
    public string Message { get; set; } = string.Empty;
}
