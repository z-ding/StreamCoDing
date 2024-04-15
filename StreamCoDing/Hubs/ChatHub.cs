using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StreamCoDing.Hubs
{
    public class ChatHub : Hub
    {
        private static int _userCountttl = 0;//ttl user connected
        private static Dictionary<string, HashSet<String>> _userCounts = new Dictionary<string, HashSet<String>>();//user  in each chat room
        private static Dictionary<string, byte[]> _screenStreams = new Dictionary<string, byte[]>(); // Keep track of screen streams per room
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
            string nickname = Context.GetHttpContext().Request.Query["access_token"];
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            if (!_userCounts.ContainsKey(roomId))
            {
                _userCounts.Add(roomId, new HashSet<String>());
            }
            _userCounts[roomId].Add(Context.ConnectionId);
            await Clients.Group(roomId).SendAsync("UserCountInRoomUpdated", _userCounts[roomId].Count);
            await Clients.Group(roomId).SendAsync("ReceiveMessageInRoom", $"broadcasting message:::<<>>::: {nickname} has joined");
        }
        public async Task LeaveRoom(string roomId)
        {
            string nickname = Context.GetHttpContext().Request.Query["access_token"];
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            _userCounts[roomId].Remove(Context.ConnectionId);
            await Clients.Group(roomId).SendAsync("UserCountInRoomUpdated", _userCounts[roomId].Count);
            await Clients.Group(roomId).SendAsync("ReceiveMessageInRoom", $"broadcasting message:::<<>>::: {nickname} has left");
        }

        public async Task SendMessageInRoom(string roomId, string user, string message)
        {
            await Clients.Group(roomId).SendAsync("ReceiveMessageInRoom", $"{user} : {message}");
        }

        // Method to start screen sharing
        public async Task StartScreenSharing(string roomId)
        {
            string nickname = Context.GetHttpContext().Request.Query["access_token"];
            await Clients.Group(roomId).SendAsync("ReceiveScreenSharingStart", $"{nickname} has started screen sharing");
        }
        // Method to stop screen sharing
        public async Task StopScreenSharing(string roomId)
        {
            string nickname = Context.GetHttpContext().Request.Query["access_token"];
            await Clients.Group(roomId).SendAsync("ReceiveScreenSharingStop", $"{nickname} has stopped screen sharing");
        }

        // Method to receive screen sharing stream
        public async Task SendScreenStream(string roomId, byte[] screenStream)
        {
            _screenStreams[roomId] = screenStream; // Store the screen stream for future users
            await Clients.Group(roomId).SendAsync("ReceiveScreenStream", screenStream); // Broadcast the screen stream to all users in the room
        }
    }
}
