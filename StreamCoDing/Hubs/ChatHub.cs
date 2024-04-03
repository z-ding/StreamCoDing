using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace StreamCoDing.Hubs
{
    public class ChatHub : Hub
    {
        private static int _userCountttl = 0;//ttl user connected
        private static Dictionary<string, int> _userCounts = new Dictionary<string, int>();//user count in each chat room

        //total server
        public override async Task OnConnectedAsync()
        {
            string nickname = Context.GetHttpContext().Request.Query["access_token"];
            _userCountttl++;
            await Clients.All.SendAsync("UserCountUpdated", _userCountttl);
            await Clients.All.SendAsync("ReceiveMessage", $"{nickname} has joined");
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            string nickname = Context.GetHttpContext().Request.Query["access_token"];
            _userCountttl--;
            await Clients.All.SendAsync("UserCountUpdated", _userCountttl);
            await Clients.All.SendAsync("ReceiveMessage", $"{nickname} has left");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", $"{user} : {message}");
        }
        //chat room functions
        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            if (!_userCounts.ContainsKey(roomId))
            {
                _userCounts[roomId] = 1;
            }
            else
            {
                _userCounts[roomId]++;
            }
            await Clients.Group(roomId).SendAsync("UserCountInRoomUpdated", _userCounts[roomId]);
            Console.Write(_userCounts[roomId]);
        }
        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            _userCounts[roomId]--;
            await Clients.Group(roomId).SendAsync("UserCountInRoomUpdated", _userCounts[roomId]);
            Console.Write(_userCounts[roomId]);
        }

        public async Task SendMessageInRoom(string roomId, string user, string message)
        {
            await Clients.Group(roomId).SendAsync("ReceiveMessageInRoom", $"{user} : {message}");
        }
    }
}
