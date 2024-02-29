namespace StreamCoDing.Entities
{
    public record People
    {//record is similar to class, but support immutable data and value equal comparison for objects
        public Guid Id { get; init; } //immutable object use init is better than set, you can do id = new() but not item.id = new()
        public string Name { get; init; }
        public int Rating { get; init; }
        public DateTimeOffset CreatedDate { get; init; }
    }

}
