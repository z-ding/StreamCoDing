using System.ComponentModel.DataAnnotations;
using static StreamCoDing.Entities.Item;

namespace StreamCoDing.Dtos
{
    public record UpdateItemDto
    {//record is similar to class, but support immutable data and value equal comparison for objects
     //add data annotations to prevent user post invalid data like null name
        [Required]
        public string Name { get; init; }
        [Required]
        public string Type { get; init; }
        [Required]
        public string Description { get; init; }
        [Required]
        [Range(1, 1000)]
        public int Number { get; init; }
        public List<TestCase> TestCases { get; init; }
    }
}
