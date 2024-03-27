using Microsoft.AspNetCore.SignalR;

namespace StreamCoDing.Hubs
{
    public class ChatHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Clients.All.SendAsync("ReceiveMessage", $"{Context.ConnectionId} has joined");
        }
        public async Task SendMessage(string user, string message)
        //with the connection we have in this hub, we can call this send message method and allow user to send messages
        {
            //postman test message: {"arguments":["testmessage"],"invocationId":"0","target":"SendMessage","type":1}[]
            //broadcasting to all clients. ReceiveMessage is the client method in the client side
            await Clients.All.SendAsync("ReceiveMessage", $"{user} : {message}");
        }
    }
}