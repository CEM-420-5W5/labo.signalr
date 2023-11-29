using System;
using System.Threading.Tasks;
using labo.signalr.api.Data;
using labo.signalr.api.Models;
using Microsoft.AspNetCore.SignalR;

namespace labo.signalr.api.Hubs
{
    public static class UserHandler
    {
        public static HashSet<string> ConnectedIds = new HashSet<string>();
    }

    public class TaskHub:Hub
	{
        ApplicationDbContext _context;

        public TaskHub(ApplicationDbContext context)
		{
            _context = context;
		}

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            UserHandler.ConnectedIds.Add(Context.ConnectionId);
            await Clients.All.SendAsync("UserCount", UserHandler.ConnectedIds.Count);
            await Clients.Caller.SendAsync("TaskList", _context.UselessTasks.ToList());
        }

        public async Task AddTask(string task)
        {
            _context.UselessTasks.Add(new UselessTask() { Text = task });
            _context.SaveChanges();
            await Clients.All.SendAsync("TaskList", _context.UselessTasks.ToList());
        }

        public async Task CompleteTask(int taskid)
        {
            var task = _context.UselessTasks.Single(t => t.Id == taskid);
            task.Completed = true;
            _context.SaveChanges();
            await Clients.All.SendAsync("TaskList", _context.UselessTasks.ToList());
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            UserHandler.ConnectedIds.Remove(Context.ConnectionId);
            await Clients.All.SendAsync("UserCount", UserHandler.ConnectedIds.Count);
            await base.OnDisconnectedAsync(exception);
        }
    }
}

