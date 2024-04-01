using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace StreamCoDing.Hubs
{
    public class ChatHub : Hub
    {
        private static int _userCount = 0;

        public override async Task OnConnectedAsync()
        {
            string nickname = Context.GetHttpContext().Request.Query["access_token"];
            _userCount++;
            await Clients.All.SendAsync("UserCountUpdated", _userCount);
            await Clients.All.SendAsync("ReceiveMessage", $"{nickname} has joined");
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            string nickname = Context.GetHttpContext().Request.Query["access_token"];
            _userCount--;
            await Clients.All.SendAsync("UserCountUpdated", _userCount);
            await Clients.All.SendAsync("ReceiveMessage", $"{nickname} has left");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", $"{user} : {message}");
        }
    }
}
