using StreamCoding.Dtos;
using StreamCoDing.Entities;

namespace StreamCoDing
{
    public static class Extensions
    {
        public static ItemDto AsDto(this Item item)
        {
            return new ItemDto
            {
                Id = item.Id,
                Name = item.Name,
                Type = item.Type,
                Description = item.Description,
                Number = item.Number,
                CreatedDate = item.CreatedDate,
                TestCases = item.TestCases
            };
        }

        public static PeopleDto AsDto(this People person)
        {
            return new PeopleDto
            {
                Id = person.Id,
                Name = person.Name,
                Rating = person.Rating,
                CreatedDate = person.CreatedDate
            };
        }
    }

}
