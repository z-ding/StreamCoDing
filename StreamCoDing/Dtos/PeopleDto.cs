using System;
//dto is the data transfer object, which is a contract with the client about the data transfer
namespace StreamCoding.Dtos
{
    public record PeopleDto
    {//record is similar to class, but support immutable data and value equal comparison for objects
        public Guid Id { get; init; } //immutable object use init is better than set, you can do id = new() but not item.id = new()
        public string Name { get; init; }
        public int Rating { get; init; }
        public DateTimeOffset CreatedDate { get; init; }
    }
}
