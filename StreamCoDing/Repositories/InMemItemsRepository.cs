using System;
using System.Collections;
using System.Collections.Generic;
using StreamCoDing.Entities;

namespace StreamCoDing.Repositories
{

    public class InMemItemsRepository : IItemsRepository
    {
        private readonly List<Item> items = new(){
            new Item { Id = Guid.NewGuid(), Name = "Longest Increasing Subsequence", Number = 1, Type = "DP",Description = "XXXXXXXXXX",CreatedDate = DateTimeOffset.UtcNow},
            new Item { Id = Guid.NewGuid(), Name = "Two Sum", Number = 2, Type = "HashMap", Description = "YYYYYYYYYY",CreatedDate = DateTimeOffset.UtcNow},
            new Item { Id = Guid.NewGuid(), Name = "GCD Traversal", Number = 3, Type = "UnionFind",Description = "ZZZZZZZZZZ", CreatedDate = DateTimeOffset.UtcNow}
        };
        public async Task<IEnumerable<Item>> GetItemsAsync()
        {//return a collection of items
            return await Task.FromResult(items);
        }
        public async Task<Item> GetItemAsync(Guid id)
        {
            var item = items.Where(item => item.Id == id).SingleOrDefault();
            return await Task.FromResult(item);
        }
        public async Task CreateItemAsync(Item item)
        {
            items.Add(item);
            await Task.CompletedTask;
        }
        public async Task UpdateItemAsync(Item item)
        {
            //since it's an in memory list, we just need to find and update the item
            var index = items.FindIndex(existingItem => existingItem.Id == item.Id);
            items[index] = item;
            await Task.CompletedTask;
        }
        public async Task DeleteItemAsync(Guid id)
        {
            var index = items.FindIndex(existingItem => existingItem.Id == id);
            items.RemoveAt(index);
            await Task.CompletedTask;
        }
    }
}
