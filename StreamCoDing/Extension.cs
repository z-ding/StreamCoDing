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
                CreatedDate = item.CreatedDate
            };
        }
    }
}
