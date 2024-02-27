using System;
using System.Collections.Generic;
using StreamCoDing.Entities;

namespace StreamCoDing.Repositories
{
    //return Task<...> to indicate it's an async function, if original void type, just return Task
    public interface IItemsRepository
    {
        Task<Item> GetItemAsync(Guid id);
        Task<IEnumerable<Item>> GetItemsAsync();
        Task CreateItemAsync(Item item);
        Task UpdateItemAsync(Item item);
        Task DeleteItemAsync(Guid id);
    }
}
