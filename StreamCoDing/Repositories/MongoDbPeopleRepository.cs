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
    public class MongoDbPeopleRepository : IPeopleRepository
    {
        private const string databaseName = "StreamCoDing";
        private const string collectionName = "People";
        private readonly IMongoCollection<People> PeopleCollection;
        private readonly FilterDefinitionBuilder<People> filterBuilder = Builders<People>.Filter;
        //constructor - to interact with mongoDB
        //receive an instance of mongo DB client here. add a nougat package
        //open a new terminal and type in : dotnet add package MongoDB.Driver
        //to get docker ready, type in terminal: docker run -d --rm --name mongo -p 27017:27017 -v mongodbdata:/data/db mongo
        //after installing, type docker ps in terminal to see the status of docker
        //go to appsettings.json to add configuration of the docker

        public MongoDbPeopleRepository(IMongoClient mongoClient)
        {
            IMongoDatabase database = mongoClient.GetDatabase(databaseName);
            PeopleCollection = database.GetCollection<People>(collectionName);
        }
        public async Task CreatePeopleAsync(People People)
        {
            await PeopleCollection.InsertOneAsync(People);
        }
        public async Task DeletePeopleAsync(Guid id)
        {
            var filter = filterBuilder.Eq(person => person.Id, id);//eq means equal
            await PeopleCollection.DeleteOneAsync(filter);
        }
        public async Task<People> GetPeopleAsync(Guid id)
        {
            var filter = filterBuilder.Eq(person => person.Id, id);//eq means equal
            return await PeopleCollection.Find(filter).SingleOrDefaultAsync();
        }
        public async Task UpdatePeopleAsync(People person)
        {
            var filter = filterBuilder.Eq(existingPeople => existingPeople.Id, person.Id);
            await PeopleCollection.ReplaceOneAsync(filter, person);
        }
        public async Task<IEnumerable<People>> GetPeopleAsync()
        {
            return await PeopleCollection.Find(new BsonDocument()).ToListAsync();
        }
    }
}
