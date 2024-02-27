using System.ComponentModel.DataAnnotations;
namespace StreamCoDing.Dtos
{
    public record CreateItemDto
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
    }
}
