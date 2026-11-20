using Microsoft.AspNetCore.SignalR;

namespace AngularSquadBackend.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task NotifyJoined(string user)
        {
            await Clients.Others.SendAsync("UserJoined", user);
        }
    }
}