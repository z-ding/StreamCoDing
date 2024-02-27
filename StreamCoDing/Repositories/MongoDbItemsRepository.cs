using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using StreamCoDing.Entities;
using StreamCoDing.Repositories;

namespace StreamCoDing.Repositories
{
    public class MongoDbItemsRepository : IItemsRepository
    {
        private const string databaseName = "StreamCoDing";
        private const string collectionName = "items";
        private readonly IMongoCollection<Item> itemsCollection;
        private readonly FilterDefinitionBuilder<Item> filterBuilder = Builders<Item>.Filter;
        //constructor - to interact with mongoDB
        //receive an instance of mongo DB client here. add a nougat package
        //open a new terminal and type in : dotnet add package MongoDB.Driver
        //to get docker ready, type in terminal: docker run -d --rm --name mongo -p 27017:27017 -v mongodbdata:/data/db mongo
        //after installing, type docker ps in terminal to see the status of docker
        //go to appsettings.json to add configuration of the docker

        public MongoDbItemsRepository(IMongoClient mongoClient)
        {
            IMongoDatabase database = mongoClient.GetDatabase(databaseName);
            itemsCollection = database.GetCollection<Item>(collectionName);
        }
        public async Task CreateItemAsync(Item item)
        {
            await itemsCollection.InsertOneAsync(item);
        }
        public async Task DeleteItemAsync(Guid id)
        {
            var filter = filterBuilder.Eq(item => item.Id, id);//eq means equal
            await itemsCollection.DeleteOneAsync(filter);
        }
        public async Task<Item> GetItemAsync(Guid id)
        {
            var filter = filterBuilder.Eq(item => item.Id, id);//eq means equal
            return await itemsCollection.Find(filter).SingleOrDefaultAsync();
        }
        public async Task UpdateItemAsync(Item item)
        {
            var filter = filterBuilder.Eq(existingitem => existingitem.Id, item.Id);
            await itemsCollection.ReplaceOneAsync(filter, item);
        }
        public async Task<IEnumerable<Item>> GetItemsAsync()
        {
            return await itemsCollection.Find(new BsonDocument()).ToListAsync();
        }
    }
}
